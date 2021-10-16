import { formatUserDocument, searchForUsers } from "Lib/user"
import { ResponseCode } from "Lib/util"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"

const handler = nextConnect()

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, limit } = JSON.parse(req.body)
  if (
    !query ||
    typeof query !== "string" ||
    !limit ||
    typeof limit !== "number"
  ) {
    return res
      .status(ResponseCode.BAD_REQUEST)
      .json({ message: "Must specify a query and a limit!" })
  }

  const userDocumentsResult = await searchForUsers(query, limit)

  if (userDocumentsResult.isOk()) {
    const userDocuments = userDocumentsResult.value.map(formatUserDocument)
    return res.status(ResponseCode.OK).json({ matches: userDocuments })
  } else {
    return res
      .status(ResponseCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong while searching for users!" })
  }
})

export default handler
