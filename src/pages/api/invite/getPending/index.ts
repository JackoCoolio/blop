import nextConnect from "next-connect"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next"
import User from "Models/User"
import { ResponseCode } from "Lib/server/util"
import Invite from "Models/Invite"

const handler = nextConnect()

handler.use(authenticationMiddleware)

interface Invite {
  inviter: string
  gameId: string
}

interface GetPendingInvitesResponse {
  pendingInvites: Invite[]
}

export async function getPendingInvites(
  userId: string
): Promise<PrivateApiResponse<GetPendingInvitesResponse>> {
  console.log("Finding user doc")
  const userDoc = await User.findById(userId)

  if (!userDoc) {
    return {
      statusCode: ResponseCode.INTERNAL_SERVER_ERROR,
      body: {
        error: "This user doesn't exist!",
      },
    }
  }

  const { pendingInvites } = userDoc
  console.log("invite ids", pendingInvites)
  const inviteDocPromises = []
  for (const inviteId of pendingInvites) {
    inviteDocPromises.push(Invite.findById(inviteId))
  }

  console.log("Finding invite docs")
  let inviteDocs = await Promise.all(inviteDocPromises)
  console.log(`${inviteDocs.length} found`)

  // guarantee that all docs are defined
  console.log(inviteDocs)
  inviteDocs = inviteDocs.filter(x => !!x)
  console.log(`${inviteDocs.length} non-null`)

  const body = {
    pendingInvites: inviteDocs.map(inviteDoc => {
      // convert private data about invites to data that the page can use
      // we can assume that every inviteDoc is defined
      return {
        inviter: inviteDoc!.inviter,
        gameId: inviteDoc!.gameId,
      }
    }),
  }

  console.log(pendingInvites)

  return {
    statusCode: ResponseCode.OK,
    body,
  }
}

handler.get(
  async (req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) => {
    const response = await getPendingInvites(req.userId)

    return res.status(response.statusCode).json(response.body)
  }
)

export default handler
