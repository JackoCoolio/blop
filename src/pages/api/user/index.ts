import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import { getMatchingUsers, getUserInformation } from "Lib/server/user"

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    // check if the id is valid
    if (!req.query.id || typeof req.query.id !== "string") {
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ message: "id must be a string!" })
    }

    // get the user information
    const informationResult = await getUserInformation(req.query.id)

    if (informationResult.isOk()) {
      return res.status(ResponseCode.OK).json(informationResult.value)
    } else {
      return res
        .status(informationResult.error.statusCode)
        .json({ message: informationResult.error.message })
    }
  }
)

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body)
    const matchingUsersResult = await getMatchingUsers(body)

    if (matchingUsersResult.isOk()) {
      return res.status(ResponseCode.OK).json(matchingUsersResult.value)
    } else {
      return res
        .status(matchingUsersResult.error.statusCode)
        .json(matchingUsersResult.error.message)
    }
  }
)

export default handler
