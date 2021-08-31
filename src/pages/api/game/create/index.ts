import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { GameType, isGameType } from "Lib/game"
import { parseCookies } from "nookies"
import { getUserDocFromSession } from "Lib/session"
import { createTicTacToeGame } from "Models/Game"
import { ResponseCode } from "Lib/util"

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

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const cookies = parseCookies({ req })
    const session = cookies.session

    const userDoc = await getUserDocFromSession(session)

    if (!userDoc) {
      console.log("not logged in")
      return res
        .status(ResponseCode.UNAUTHORIZED)
        .json({ error: "Session must be logged in to create a game." })
    }

    try {
      // parse the request body
      var { type } = await parseBody(req.body)
    } catch (error) {
      console.log("error parsing body")
      return res.status(ResponseCode.BAD_REQUEST).json({ error })
    }

    // add the game to the games collection
    let gameDoc
    switch (type) {
      case "tictactoe":
        gameDoc = await createTicTacToeGame([userDoc._id])
        break
      default:
        return res
          .status(ResponseCode.BAD_REQUEST)
          .json({ error: "Invalid game type!" })
    }

    console.log("returning new game info")
    return res.status(ResponseCode.CREATED).json({ id: gameDoc._id })
  } catch (e) {
    console.error(e)
  }
})

export default handler
