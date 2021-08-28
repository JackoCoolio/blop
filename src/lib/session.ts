import Session from "Models/Session"
import User from "Models/User"

export async function isSessionLoggedIn(session?: string): Promise<boolean> {
  // if no ID was provided, the session is not logged in
  if (!session) return false

  const sessionDoc = await Session.findById(session)

  if (!sessionDoc) return false

  // in practice, we should be able to return true at this point, but we should probably check if the user actually exists
  const userDoc = await User.findById(sessionDoc.userId)

  // return whether or not the user exists
  return !!userDoc
}

export async function createNewSession(userId: string): Promise<string> {
  const doc = await Session.create({
    userId,
  })

  return doc._id
}
