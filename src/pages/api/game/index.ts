import { getCurrentGames } from "Lib/server/games"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const gamesResult = await getCurrentGames(req.userId)

    if (gamesResult.isOk()) {
      return res.status(ResponseCode.OK).json(gamesResult.value)
    } else {
      return res
        .status(gamesResult.error.statusCode)
        .json({ message: gamesResult.error.message })
    }
  }
)

export default handler
