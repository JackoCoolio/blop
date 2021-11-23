import { getGameMetadata } from "Lib/server/games"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const handler = nextConnect<
  NextApiRequest & AuthenticatedRequest,
  NextApiResponse
>()

handler.use(authenticationMiddleware)

handler.get(async (req, res) => {
  // this is impossible because of the way Next.js handles dynamic routes,
  // but all TS knows is that it's either a string or a string[]
  if (Array.isArray(req.query.gameId)) return

  // get metadata
  const metadataResult = await getGameMetadata(req.query.gameId, req.userId)

  // send response
  return metadataResult.match(
    metadata => {
      res.status(ResponseCode.OK).json(metadata)
    },
    err => {
      return res.status(err.statusCode).json({ message: err.message })
    }
  )
})

export default handler
