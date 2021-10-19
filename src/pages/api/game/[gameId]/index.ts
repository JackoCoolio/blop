import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import Game from "Models/Game"
import { ResponseCode } from "Lib/server/util"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"

const handler = nextConnect()

// block unauthorized requests
handler.use(authenticationMiddleware)

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.gameId

  const gameDoc = await Game.findById(gameId)

  res.status(200).json(gameDoc)
})

handler.patch(
  async (req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) => {
    const gameId = req.query.gameId
    const gameDoc = await Game.findById(gameId)

    if (!gameDoc) {
      console.error("no game doc")
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ error: "No such game exists with the given ID!" })
    }

    try {
      var body = JSON.parse(req.body)
    } catch (error) {
      console.error("invalid body", error)
      return res.status(ResponseCode.BAD_REQUEST).json({ error })
    }

    gameDoc.state = {
      ...body,
    }
    gameDoc.turn++

    gameDoc.markModified("state")
    gameDoc.markModified("turn")
    await gameDoc.save()

    console.log("success")
    res.status(ResponseCode.NO_CONTENT)
  }
)

export default handler
