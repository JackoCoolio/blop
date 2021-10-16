import { Result, ok, err } from "neverthrow"
import { ResponseCode } from "./util"
import User, { UserInterface } from "Models/User"
import { Document } from "mongoose"

// the base information about a given user that users should be able to see
export interface UserFacingUserInformation {
  id: string
  username: string
}

/**
 * Removes unneeded properties from a user document.
 *
 * @param doc the user doc to use
 * @returns a UserFacingUserInformation object
 */
export function formatUserDocument(
  doc: Document<any, any, UserInterface> & UserInterface
): UserFacingUserInformation {
  return {
    id: doc._id,
    username: doc.username,
  }
}

/**
 * Returns user-facing information about a given user.
 *
 * @param userId the user's ID
 * @returns a UserFacingUserInformation or an ApiError in a Result
 */
export async function getUserInformation(
  userId: string
): Promise<Result<UserFacingUserInformation, ApiError>> {
  // find the user doc
  const userDoc = await User.findById(userId)

  // if there isn't a user doc, the userId was invalid
  if (!userDoc) {
    return err({
      message: "Invalid userId!",
      statusCode: ResponseCode.BAD_REQUEST,
    })
  }

  // format the user doc
  const result: UserFacingUserInformation = {
    id: userId,
    username: userDoc.username,
  }

  return ok(result)
}

/**
 * Searches for users with the given query string.
 * @param query the query string
 * @param limit the maximum number of users to return
 * @returns a list of User documents
 */
export async function searchForUsers(
  query: string,
  limit: number
): Promise<
  Result<(Document<any, any, UserInterface> & UserInterface)[], void>
> {
  const searchResultDocuments = await User.fuzzySearch(query).limit(limit)

  return ok(searchResultDocuments)
}
