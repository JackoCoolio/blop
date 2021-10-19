import Invite from "Models/Invite"
import User from "Models/User"

async function addInviteToUser(userId: string, inviteId: string) {
  const userDoc = await User.findById(userId)

  if (!userDoc) return false

  // not sure if i can just push here
  userDoc.pendingInvites = [...userDoc.pendingInvites, inviteId]

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
  console.log("creating new invites")
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
