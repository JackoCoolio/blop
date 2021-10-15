import FriendsList from "Models/FriendsList"
import User, { UserInterface } from "Models/User"
import { Document } from "mongoose"
import { Result, ok, err } from "neverthrow"

/**
 * Creates a new user.
 *
 * @param refreshToken the new user's Discord refreshToken
 * @returns the created user document in a Result
 */
export async function createUser(
  refreshToken: string
): Promise<Result<Document<any, any, UserInterface> & UserInterface, Error>> {
  // create the user document
  try {
    var userDoc = await User.create({
      refreshToken,
      games: [],
      newUser: true,
      pendingInvites: [],
    })
  } catch (e: any) {
    console.error(e)
    return err(new Error(e))
  }

  // create the user's friends list document
  try {
    await FriendsList.create({
      _id: userDoc._id,
      friends: [],
      sentRequests: [],
      receivedRequests: [],
    })
  } catch (e: any) {
    console.error(e)
    return err(new Error(e))
  }

  // return the user document
  return ok(userDoc)
}
