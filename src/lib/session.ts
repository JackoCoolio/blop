import Session from "Models/Session"
import User from "Models/User"
import { throwsException } from "./util"

export async function isSessionLoggedIn(session?: string): Promise<boolean> {
  return !(await throwsException(async () => {
    await getUserDocFromSession(session)
  }))
}

export async function getUserDocFromSession(session?: string) {
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
