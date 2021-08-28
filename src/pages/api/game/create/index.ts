import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { GameType, isGameType } from "Lib/game"
import { parseCookies } from "nookies"
import { isSessionLoggedIn } from "Lib/session"
import Game from "Models/Game"

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
  const cookies = parseCookies({ req })
  const session = cookies.session

  const loggedIn = await isSessionLoggedIn(session)

  if (!loggedIn) {
    console.log("not logged in")
    return res
      .status(401)
      .json({ error: "Session must be logged in to create a game." })
  }

  try {
    // parse the request body
    var { type } = await parseBody(req.body)
  } catch (error) {
    console.log("error parsing body")
    return res.status(400).json({ error })
  }

  // add the game to the games collection

  const gameDoc = await Game.create({
    type,
  })

  console.log("returning new game info")
  return res.status(201).json({ id: gameDoc._id })
})

export default handler
