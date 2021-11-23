import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { createNewInvite } from "Lib/server/invite"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"

interface InviteCreateBody {
  invitees: string[]
  gameId: string
}

function isInviteCreateBody(body: any): body is InviteCreateBody {
  return (
    !!body && Array.isArray(body.invitees) && typeof body["gameId"] === "string"
  )
}

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body)

    // check if request body is formatted correctly
    if (!isInviteCreateBody(body)) {
      console.log(body)
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ message: "Invalid body!" })
    }

    await createNewInvite(req.userId, body.invitees, body.gameId)

    // need a response here
    res.status(ResponseCode.NO_CONTENT).end()
  }
)

export default handler
