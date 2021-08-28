import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import Game from "Models/Game"

const handler = nextConnect()

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const gameId = req.query.gameId

  const gameDoc = await Game.findById(gameId)

  res.status(200).json(gameDoc)
})

export default handler
