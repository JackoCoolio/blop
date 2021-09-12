import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { parseCookies } from "nookies"
import { createNewInvite } from "Lib/invite"
import { ResponseCode } from "Lib/util"
import { getSessionInformation } from "../../session"
import { isSuccessfulResponse, respond } from "Lib/response"

interface InviteCreateBody {
  invitees: string[]
  gameId: string
}

function parseBody(body: any): Promise<InviteCreateBody> {
  return new Promise<InviteCreateBody>((resolve, reject) => {
    try {
      body = JSON.parse(body)
    } catch (e) {
      return reject("Body must be valid JSON.")
    }

    const invitees = body.invitees
    if (!invitees || !Array.isArray(invitees)) {
      return reject("Invitees must be an array of strings!")
    }

    const gameId = body.gameId
    if (!gameId || typeof gameId !== "string") {
      return reject("GameID must be a string!")
    }

    return resolve(body)
  })
}

interface CreateInviteResponse {
  numInvited: number
}

/**
 *
 * @param inviter the user ID of the user that created the invite
 * @param invitees an array of user IDs for the invited users
 * @param gameId the ID of the game
 *
 * @returns a private API response for a boolean, which represents whether or not the invite was created successfully
 */
export async function createInvite(
  inviter: string,
  invitees: string[],
  gameId: string
): Promise<PrivateApiResponse<CreateInviteResponse>> {
  const successes = await createNewInvite(inviter, invitees, gameId)
  const numInvited = successes.reduce((total, succ) => {
    return total + (succ ? 1 : 0)
  }, 0)

  return {
    statusCode:
      numInvited > 0 ? ResponseCode.CREATED : ResponseCode.BAD_REQUEST,
    body: {
      numInvited,
    },
  }
}

const handler = nextConnect()

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { session } = parseCookies({ req })

  // check if request body is formatted correctly
  try {
    var body = await parseBody(req.body)
  } catch (e) {
    return res.status(ResponseCode.BAD_REQUEST).json({ error: e })
  }

  const sessionResponse = await getSessionInformation(session)

  // check if session is logged in
  if (
    !isSuccessfulResponse(sessionResponse) ||
    !sessionResponse.body.loggedIn
  ) {
    return respond(res, sessionResponse)
  } else {
    const inviter = sessionResponse.body.userId
    const privResponse = await createInvite(inviter, body.invitees, body.gameId)

    console.log(privResponse)
    return respond(res, privResponse)
  }
})

export default handler
