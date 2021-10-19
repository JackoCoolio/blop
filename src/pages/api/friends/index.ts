import nextConnect from "next-connect"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next/dist/shared/lib/utils"
import FriendsList from "Models/FriendsList"
import { ResponseCode } from "Lib/server/util"
import { Result, err, ok } from "neverthrow"

const handler = nextConnect()

handler.use(authenticationMiddleware)

interface UserFacingFriendInterface {
  id: string
  // if since is null, this is a friend request
  since: Date | null
}

/**
 * Gets the list of a user's friends.
 *
 * @param userId the user's ID
 * @param includeRequests whether or not incoming friend requests should be included.
 * Incoming friend requests' `.since` value will be null.
 * @returns a list of FriendInterfaces or an ApiError in a Result
 */
export async function getFriendsList(
  userId: string,
  includeRequests: boolean = true
): Promise<Result<UserFacingFriendInterface[], ApiError>> {
  // find the user's friends list document
  const friendsListDoc = await FriendsList.findById(userId)

  // if there was no friends list doc, return an error
  if (!friendsListDoc) {
    return err({
      message: "Invalid userId",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  // get friends and incoming requests
  const friendsList = friendsListDoc.friends

  let result: UserFacingFriendInterface[] = [...friendsList]

  // if we should include requests, do so
  if (includeRequests) {
    const friendRequests = friendsListDoc.receivedRequests.map(id => {
      return { id, since: null }
    })
    result = result.concat(friendRequests)
  }

  // return friends and requests
  return ok(result)
}

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const friendsListResult = await getFriendsList(req.userId)

    if (friendsListResult.isOk()) {
      return res.status(ResponseCode.OK).json(friendsListResult.value)
    } else {
      return res
        .status(friendsListResult.error.statusCode)
        .json({ error: friendsListResult.error.message })
    }
  }
)

/**
 * Adds a friend invite to the user's sent list and the target's received list.
 *
 * @param userId the sender's user ID
 * @param targetId the receiver's user ID
 * @returns void or an ApiError in a Result
 */
export async function sendFriendInvite(
  userId: string,
  targetId: string
): Promise<Result<void, ApiError>> {
  // make sure the user isn't trying to friend themselves
  if (userId === targetId) {
    return err({
      message: "You can't send a friend request to yourself!",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  // find the sender's FriendsList doc
  const senderFriendsListDoc = await FriendsList.findById(userId)

  // if no FL doc was found, return an error
  if (!senderFriendsListDoc) {
    return err({
      message: "Invalid userId!",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  // find target's FL doc
  const targetFriendsListDoc = await FriendsList.findById(targetId)

  // again, if no FL doc was found, return an error
  if (!targetFriendsListDoc) {
    return err({
      message: "Invalid targetId!",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  // check if a friend request has been sent in the opposite direction (from target to sender)
  const senderIndex = senderFriendsListDoc.receivedRequests.indexOf(targetId)
  const targetIndex = targetFriendsListDoc.sentRequests.indexOf(userId)
  if (senderIndex !== -1 && targetIndex !== -1) {
    // current date and time
    const since = new Date()

    // add the users to each other's friends lists
    senderFriendsListDoc.friends.push({
      id: targetId,
      since,
    })

    targetFriendsListDoc.friends.push({
      id: userId,
      since,
    })

    // if a friend request was sent the other way, just accept it
    senderFriendsListDoc.receivedRequests.splice(senderIndex, 1)
    targetFriendsListDoc.sentRequests.splice(targetIndex, 1)

    // wait for both documents to save
    await Promise.all([
      senderFriendsListDoc.save(),
      targetFriendsListDoc.save(),
    ])

    return ok(undefined)
  } else {
    // otherwise, just send a new one

    // update database
    if (!senderFriendsListDoc.sentRequests.includes(targetId))
      senderFriendsListDoc.sentRequests.push(targetId)
    if (!targetFriendsListDoc.receivedRequests.includes(userId))
      targetFriendsListDoc.receivedRequests.push(userId)

    // save database
    try {
      await Promise.all([
        senderFriendsListDoc.save(),
        targetFriendsListDoc.save(),
      ])
      return ok(undefined)
    } catch (e) {
      return err({
        message: "Something went wrong while sending the friend request!",
        statusCode: ResponseCode.INTERNAL_SERVER_ERROR,
      })
    }
  }
}

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    // if the body isn't valid json, return error
    try {
      var json = JSON.parse(req.body)
    } catch (e) {
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ error: "Invalid JSON!" })
    }

    // check if targetId is a string
    // note: we don't have to check if req.userId is a string, because
    // authenticationMiddleware guarantees that already
    if (typeof json.targetId !== "string") {
      res
        .status(ResponseCode.BAD_REQUEST)
        .json({ error: "Must specify a string targetId!" })
    }

    // add the friend invites
    const sendResult = await sendFriendInvite(req.userId, json.targetId)

    // send response
    if (sendResult.isErr()) {
      return res
        .status(sendResult.error.statusCode)
        .json({ error: sendResult.error.message })
    } else {
      return res.status(ResponseCode.OK)
    }
  }
)

export default handler
