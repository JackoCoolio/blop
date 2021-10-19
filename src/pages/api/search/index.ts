import { formatUserDocument, searchForUsers } from "Lib/server/user"
import { ResponseCode } from "Lib/server/util"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"

const handler = nextConnect()

// require user to be logged in
handler.use(authenticationMiddleware)

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const { query, limit = 5, scope = {} } = JSON.parse(req.body)

    if (
      !query ||
      typeof query !== "string" ||
      typeof limit !== "number" ||
      typeof scope !== "object"
    ) {
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ message: "Must specify a query, scope, and a limit!" })
    }

    // search for users with the query
    const userDocumentsResult = await searchForUsers(
      query,
      limit,
      {
        group: "all",
        ...scope,
        exclude: {
          me: true,
          friends: false,
          users: [],
          ...scope.exclude,
        },
      },
      req.userId
    )

    if (userDocumentsResult.isOk()) {
      // format the returned documents to remove private information
      const userDocuments = userDocumentsResult.value.map(formatUserDocument)
      return res.status(ResponseCode.OK).json({ matches: userDocuments })
    } else {
      return res
        .status(ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong while searching for users!" })
    }
  }
)

export default handler
