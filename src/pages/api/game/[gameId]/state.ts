import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import Game from "Models/Game"
import { ResponseCode } from "Lib/server/util"
import {
  authenticationMiddleware,
  AuthenticatedRequest,
} from "Middleware/loginChecker"
import { GameInterface, getWinners, isUsersTurn } from "Lib/client/game"
import { TicTacToe } from "Lib/client/game/tictactoe"

const handler = nextConnect()

// block unauthorized requests
handler.use(authenticationMiddleware)

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const gameId = req.query.gameId

    const gameDoc = await Game.findById(gameId)

    if (!gameDoc) {
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ message: "Invalid game id!" })
    }

    const out: GameInterface = {
      _id: gameDoc._id,
      created: gameDoc.created,
      type: gameDoc.type,
      myTurn: isUsersTurn(req.userId, gameDoc),
      players: gameDoc.players,
      state: gameDoc.state,
      turn: gameDoc.turn,
      winners: getWinners(gameDoc),
    }

    res.status(ResponseCode.OK).json(out)
  }
)

handler.patch(
  async (req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) => {
    const gameId = req.query.gameId
    let gameDoc = await Game.findById(gameId)

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

    let validMove = false
    if (gameDoc.type === "tictactoe") {
      if (TicTacToe.isValidMove(gameDoc, body, req.userId)) {
        validMove = true
        gameDoc = TicTacToe.applyMove(gameDoc, body)
      }
    }

    if (validMove) {
      // for some reason, TS thinks gameDoc might be null
      // AFAIK this is impossible
      await gameDoc!.save()

      res.status(ResponseCode.NO_CONTENT).end()
    } else {
      res.status(ResponseCode.BAD_REQUEST).json({ message: "Invalid move!" })
    }
  }
)

export default handler
