import Session from "Models/Session"
import User, { UserInterface } from "Models/User"
import { Document } from "mongoose"
import { getSessionInformation } from "src/pages/api/session"
import { isSuccessfulResponse } from "./response"

export async function isSessionLoggedIn(session?: string): Promise<boolean> {
  if (!session) return false

  const sessionResponse = await getSessionInformation(session)
  return isSuccessfulResponse(sessionResponse) && sessionResponse.body.loggedIn
}

export async function getUserDocFromSession(
  session?: string
): Promise<Document<any, any, UserInterface>> {
  if (!session) throw "No session token!"

  const sessionDoc = await Session.findById(session)

  if (!sessionDoc) throw "Invalid session token!"

  const userDoc = await User.findById(sessionDoc.userId)

  if (!userDoc) throw "This user doesn't exist!"

  return userDoc
}

export async function createNewSession(userId: string): Promise<string> {
  const doc = await Session.create({
    userId,
  })

  return doc._id
}
