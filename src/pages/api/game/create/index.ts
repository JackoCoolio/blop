import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { GameType, isGameType } from "Lib/client/game"
import { createTicTacToeGame } from "Models/Game"
import { ResponseCode } from "Lib/server/util"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"
import User from "Models/User"

interface GameCreateBody {
  type: GameType
}

function parseBody(body: any): Promise<GameCreateBody> {
  return new Promise<GameCreateBody>((resolve, reject) => {
    try {
      body = JSON.parse(body)
    } catch (e) {
      return reject("Body must be valid JSON.")
    }

    const gameType = body.type
    if (!isGameType(gameType)) {
      return reject("Type must be a valid game type.")
    }

    return resolve(body)
  })
}

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.post(
  async (req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) => {
    try {
      // parse the request body
      var { type } = await parseBody(req.body)
    } catch (error) {
      return res.status(ResponseCode.BAD_REQUEST).json({ error })
    }

    // add the game to the games collection
    let gameDoc
    switch (type) {
      case "tictactoe":
        gameDoc = await createTicTacToeGame([req.userId])
        break
      default:
        return res
          .status(ResponseCode.BAD_REQUEST)
          .json({ error: "Invalid game type!" })
    }

    await User.updateOne(
      { _id: req.userId },
      {
        $push: {
          games: gameDoc._id,
        },
      }
    )

    return res.status(ResponseCode.CREATED).json({ id: gameDoc._id })
  }
)

export default handler
