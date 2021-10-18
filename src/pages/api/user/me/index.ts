import { ResponseCode } from "Lib/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import User, { UserInterface } from "Models/User"
import { err, ok, Result } from "neverthrow"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"
import update, { Spec } from "immutability-helper"
import { getUserInformation } from "Lib/user"
import PartialUser from "Models/PartialUser"
import { finalizeUser } from "Lib/userSetup"

const handler = nextConnect()

// user must be authenticated to use this route
handler.use(authenticationMiddleware)

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const informationResult = await getUserInformation(req.userId)

    if (informationResult.isOk()) {
      return res.status(ResponseCode.OK).json(informationResult.value)
    } else {
      return res
        .status(informationResult.error.statusCode)
        .json({ message: informationResult.error.message })
    }
  }
)

type UpdateUserSpec = Spec<UserInterface, never>
/**
 * Update the user with ID userId with the given changes.
 * @param userId the user's ID
 * @param change the Spec to change the user doc with
 * @returns void or an ApiError in a Result
 */
export async function updateUser(
  userId: string,

  // for some very odd reason, the TS server can't understand this type.
  // I'm probably doing something wrong, but I'm not sure where, so I'm
  // just using any and keeping the type here for a reminder
  change: UpdateUserSpec | any
): Promise<Result<void, ApiError>> {
  // find the user from the ID
  let userDoc = await User.findById(userId)

  // if we couldn't find the user, the ID was invalid
  if (!userDoc) {
    let partialUserDoc = await PartialUser.findById(userId)

    if (!partialUserDoc)
      return err({
        message: "Invalid userId!",
        statusCode: ResponseCode.BAD_REQUEST,
      })

    // ensure that the new username is specified
    if (!change.username) {
      return err({
        message: "New users must set their usernames!",
        statusCode: ResponseCode.BAD_REQUEST,
      })
    }

    // finalize the user with the given changes
    await finalizeUser(partialUserDoc._id, change)

    return ok(undefined)
  } else {
    // change the local copy of the doc
    userDoc = update(userDoc, change)

    // save it to the database
    // note: depending on the definition of User, this might
    //       not be needed, but just in case, we'll keep it
    await userDoc.save()

    return ok(undefined)
  }
}

handler.patch(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const { username } = JSON.parse(req.body)
    const { userId } = req

    // here, UpdateUserSpec is understood. i'm baffled
    const change: UpdateUserSpec = {}
    let valid = !!username // || !!age || !!bio ...

    // if no valid fields were specified, return an error
    if (!valid) {
      return res.status(ResponseCode.BAD_REQUEST).json({
        message: "No valid parameters assigned!",
      })
    }

    // change only the values that the API caller specifies
    if (username)
      change.username = {
        $set: username,
      }

    // actually update the user document
    const updateResult = await updateUser(userId, change)

    if (updateResult.isOk()) {
      return res.status(ResponseCode.NO_CONTENT).end()
    } else {
      return res
        .status(updateResult.error.statusCode)
        .json({ message: updateResult.error.message })
    }
  }
)

export default handler
