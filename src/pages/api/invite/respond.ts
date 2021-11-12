import { respondToInvite } from "Lib/server/invite"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body)
    console.log("/api/invite/respond: ", req.body)

    const respondResult = await respondToInvite(
      body.inviteId,
      req.userId,
      body.response
    )

    if (respondResult.isOk()) {
      return res.status(ResponseCode.OK).end()
    } else {
      return res
        .status(respondResult.error.statusCode)
        .json({ message: respondResult.error.message })
    }
  }
)

export default handler
