import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import { parseCookies } from "nookies"
import { isSessionLoggedIn } from "Lib/session"
import { isVerifiedEnv } from "Lib/env"

const handler = nextConnect()

/**
 * Returns whether or not the session is logged in.
 *
 * Method: GET
 *
 * Response looks like:
 * {
 *   loggedIn: boolean
 * }
 */
handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = parseCookies({ req })
  const session = cookies.session

  if (!isVerifiedEnv(process.env)) throw new Error(".env is missing a value!")

  const loggedIn = await isSessionLoggedIn(session)

  return res.status(200).json({
    loggedIn,
  })
})

export default handler
