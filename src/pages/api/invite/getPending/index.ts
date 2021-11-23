import nextConnect from "next-connect"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next"
import { ResponseCode } from "Lib/server/util"
import { getPendingInvites } from "Lib/server/invite"

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.get(
  async (req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) => {
    const pendingInvitesResult = await getPendingInvites(req.userId)

    if (pendingInvitesResult.isOk()) {
      return res.status(ResponseCode.OK).json(pendingInvitesResult.value)
    } else {
      return res
        .status(pendingInvitesResult.error.statusCode)
        .json({ message: pendingInvitesResult.error.message })
    }
  }
)

export default handler
