import { getUserDocFromSession } from "Lib/server/session"
import { formatUserDocument, searchForUsers } from "Lib/server/user"
import { ResponseCode } from "Lib/server/util"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"
import { parseCookies } from "nookies"

const handler = nextConnect()

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, limit, excludeMe } = JSON.parse(req.body)
  if (
    !query ||
    typeof query !== "string" ||
    !limit ||
    typeof limit !== "number" ||
    !["boolean", "undefined"].includes(typeof excludeMe)
  ) {
    return res
      .status(ResponseCode.BAD_REQUEST)
      .json({ message: "Must specify a query and a limit!" })
  }

  let searcherId = undefined

  // if searcher chose to exclude themselves, get their user ID and exclude them
  if (!!excludeMe) {
    const { session } = parseCookies({ req })
    // get their user doc
    const searcherDoc = await getUserDocFromSession(session)
    if (searcherDoc) searcherId = searcherDoc._id
  }

  // search for users with the query
  const userDocumentsResult = await searchForUsers(query, limit, searcherId)

  if (userDocumentsResult.isOk()) {
    // format the returned documents to remove private information
    const userDocuments = userDocumentsResult.value.map(formatUserDocument)
    return res.status(ResponseCode.OK).json({ matches: userDocuments })
  } else {
    return res
      .status(ResponseCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong while searching for users!" })
  }
})

export default handler
