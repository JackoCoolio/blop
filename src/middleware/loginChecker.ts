import { isSuccessfulResponse } from "Lib/server/response"
import { ResponseCode } from "Lib/server/util"
import { NextApiRequest, NextApiResponse } from "next"
import nextConnect from "next-connect"
import { parseCookies, setCookie } from "nookies"
import { getSessionInformation } from "src/pages/api/session"

export interface AuthenticatedRequest {
  sessionId: string
  userId: string
}

async function checkForLogin(
  req: AuthenticatedRequest & NextApiRequest,
  res: NextApiResponse,
  next: any
) {
  const { session } = parseCookies({ req })
  const sessionResponse = await getSessionInformation(session)

  req.sessionId = session

  if (
    !isSuccessfulResponse(sessionResponse) ||
    !sessionResponse.body.loggedIn
  ) {
    setCookie({ res }, "session", "invalid", {
      path: "/",
      expires: new Date(0), // tell browser to delete session cookie, assuming no one is living in the year 1969 ;)
    })
    return res
      .status(ResponseCode.UNAUTHORIZED)
      .json({ error: "Must be logged in to access this API route." })
  } else {
    req.userId = sessionResponse.body.userId
    return next()
  }
}

const authenticationMiddleware = nextConnect()

authenticationMiddleware.use(checkForLogin)

export { authenticationMiddleware }
