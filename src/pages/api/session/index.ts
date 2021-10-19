import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { parseCookies } from "nookies"
import { isVerifiedEnv } from "Lib/server/env"
import User from "Models/User"
import Session from "Models/Session"
import { ResponseCode } from "Lib/server/util"
import PartialUser from "Models/PartialUser"

const handler = nextConnect()

type SessionInformation =
  | {
      loggedIn: false
    }
  | {
      loggedIn: true
      userId: string
    }

/**
 *
 * @param sessionId the nanoid of the session
 * @returns an API response containing a status code and a body
 */
export async function getSessionInformation(
  sessionId: string
): Promise<PrivateApiResponse<SessionInformation>> {
  if (!isVerifiedEnv(process.env)) throw new Error(".env is missing a value!")

  if (!sessionId) {
    return {
      statusCode: ResponseCode.OK,
      body: {
        loggedIn: false,
      },
    }
  }

  const sessionDoc = await Session.findById(sessionId)

  if (!sessionDoc) {
    return {
      statusCode: ResponseCode.BAD_REQUEST,
      body: {
        error: "Session does not exist.",
      },
    }
  }

  const userDoc =
    (await User.findById(sessionDoc.userId)) ||
    (await PartialUser.findById(sessionDoc.userId))

  const loggedIn = !!userDoc

  if (loggedIn) {
    return {
      statusCode: ResponseCode.OK,
      body: {
        loggedIn,
        userId: sessionDoc.userId,
      },
    }
  } else {
    return {
      statusCode: ResponseCode.OK,
      body: {
        loggedIn,
      },
    }
  }
}

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = parseCookies({ req })
  const sessionId = cookies.session

  const response = await getSessionInformation(sessionId)
  res.status(response.statusCode).json(response.body)
})

export default handler
