import Game from "Models/Game"
import Invite from "Models/Invite"
import User from "Models/User"
import { Result, ok, err } from "neverthrow"
import { ResponseCode } from "./util"

async function addInviteToUser(userId: string, inviteId: string) {
  const userDoc = await User.findById(userId)

  if (!userDoc) return false

  userDoc.pendingInvites.push(inviteId)

  try {
    await userDoc.save()
    return true
  } catch (e) {
    return false
  }
}

export async function createNewInvite(
  inviter: string,
  invitees: string[],
  gameId: string
) {
  const invitePromises = []
  for (const invitee of invitees) {
    invitePromises.push(
      Invite.create({
        inviter,
        invitee,
        gameId,
      })
    )
  }
  // invitePromises.map(x => x.catch())

  var inviteDocs = await Promise.all(invitePromises)

  const inviteePromises = []
  for (const inviteDoc of inviteDocs) {
    inviteePromises.push(addInviteToUser(inviteDoc.invitee, inviteDoc._id))
  }

  // inviteePromises.map(x => x.catch())

  return await Promise.all(inviteePromises)
}

interface IncomingInvite {
  id: string
  inviter: string
  gameId: string
}

export async function getPendingInvites(
  userId: string
): Promise<Result<IncomingInvite[], ApiError>> {
  const userDoc = await User.findById(userId)

  if (!userDoc) {
    return err({
      message: "Invalid userId!",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  const { pendingInvites } = userDoc

  const invalidInviteIds: string[] = []

  // query database for invite docs
  const inviteDocs = (
    await Promise.all(
      pendingInvites.map(async inviteId => {
        const inviteDoc = await Invite.findById(inviteId)

        if (!inviteDoc) {
          invalidInviteIds.push(inviteId)
        }

        return inviteDoc
      })
    )
  ).filter(x => !!x) // remove invalid invite docs

  // delete invalid invite ids
  userDoc.pendingInvites = userDoc.pendingInvites.filter(
    x => !invalidInviteIds.includes(x)
  )

  const formattedInvites = inviteDocs.map(inviteDoc => {
    // convert private data about invites to data that the page can use
    // we can assume that every inviteDoc is defined
    return {
      id: inviteDoc!._id,
      inviter: inviteDoc!.inviter,
      gameId: inviteDoc!.gameId,
    }
  })

  return ok(formattedInvites)
}

export async function respondToInvite(
  inviteId: string,
  userId: string,
  response: "accept" | "decline"
): Promise<Result<void, ApiError>> {
  console.log("respondToInvite: ", { inviteId, userId, response })
  const inviteDoc = await Invite.findById(inviteId)

  if (!inviteDoc) {
    return err({
      statusCode: ResponseCode.BAD_REQUEST,
      message: "Invalid inviteId!",
    })
  }

  switch (response) {
    case "accept": // add the user to the game
      const gameDoc = await Game.findById(inviteDoc.gameId)

      // if for some reason the game doesn't exist, just return an error
      if (!gameDoc) {
        // delete the invite so the user doesn't have to see it
        await inviteDoc.delete()
        return err({
          statusCode: ResponseCode.INTERNAL_SERVER_ERROR,
          message: "Something went wrong while accepting the invite!",
        })
      }

      // make sure we don't add the user twice
      if (!gameDoc.players.includes(userId)) {
        gameDoc.players.push(userId)
        await gameDoc.save()
      }
      break
    case "decline":
      break
    default:
      return err({
        statusCode: ResponseCode.BAD_REQUEST,
        message: "Invalid response type! Must be 'accept' or 'decline'.",
      })
  }

  // delete the invite
  await inviteDoc.delete()

  return ok(undefined)
}
