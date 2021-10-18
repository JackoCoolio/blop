import FriendsList from "Models/FriendsList"
import PartialUser, { PartialUserInterface } from "Models/PartialUser"
import User, { UserInterface } from "Models/User"
import { Document } from "mongoose"
import { Result, ok, err } from "neverthrow"
import update, { Spec } from "immutability-helper"

/**
 * Creates a new user.
 *
 * @param refreshToken the new user's Discord refreshToken
 * @returns the created user document in a Result
 */
export async function createUser(
  refreshToken: string
): Promise<
  Result<Document<any, any, PartialUserInterface> & PartialUserInterface, Error>
> {
  // create the user document
  try {
    var partialUserDoc = await PartialUser.create({
      refreshToken,
      // games: [],
      // partialUser: true,
      // pendingInvites: [],
    })
  } catch (e: any) {
    console.error(e)
    return err(new Error(e))
  }

  // return the user document
  return ok(partialUserDoc)
}

/**
 * Creates a new User from a given PartialUser's id.
 * @param userId the user's _id
 * @param change the spec to modify the new user with. This must specify `username`.
 * @returns the new User document or an Error in a Result
 */
export async function finalizeUser(
  userId: string,
  change: Spec<UserInterface>
): Promise<Result<Document<any, any, UserInterface> & UserInterface, Error>> {
  const partialUserDoc = await PartialUser.findById(userId)

  if (!partialUserDoc) {
    return err(new Error("Couldn't finalize a user that doesn't exist!"))
  }

  // I would rather use `!change.username` but typescript is weird
  if (!Object.keys(change).includes("username")) {
    return err(new Error("Must specify a username!"))
  }

  // create user document
  try {
    const userData: UserInterface = {
      _id: partialUserDoc._id,
      username: "",
      discordId: partialUserDoc.discordId,
      refreshToken: partialUserDoc.refreshToken,
      games: [],
      pendingInvites: [],
    }

    var userDoc = await User.create(update(userData, change))
  } catch (e: any) {
    return err(new Error(e))
  }

  // delete new user document
  try {
    await partialUserDoc.delete()
  } catch (e: any) {
    return err(new Error(e))
  }

  // create friends list
  try {
    await FriendsList.create({
      _id: userDoc._id,
      friends: [],
      sentRequests: [],
      receivedRequests: [],
    })
  } catch (e: any) {
    return err(new Error(e))
  }

  return ok(userDoc)
}
