import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { setCookie } from "nookies"
import { getUser } from "Lib/server/discord"
import { isVerifiedEnv } from "Lib/server/env"
import User from "Models/User"
import { createNewSession } from "Lib/server/session"
import { createUser } from "Lib/server/userSetup"
import { ResponseCode } from "Lib/server/util"
import PartialUser from "Models/PartialUser"

const handler = nextConnect()

async function fetchToken(
  params: URLSearchParams
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch("https://discord.com/api/v8/oauth2/token", {
    method: "post",
    body: params.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  const json = await response.json()

  return {
    accessToken: json["access_token"],
    refreshToken: json["refresh_token"],
  }
}

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.url) throw new Error("No URL!")

  if (!isVerifiedEnv(process.env)) throw new Error(".env is missing a value!")

  const url = new URL(req.url, `http://${req.headers.host}`)
  const params = url.searchParams

  const code = params.get("code")
  if (!code) {
    return res.redirect("/")
  }

  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI,
  })

  const { accessToken, refreshToken } = await fetchToken(body)

  // get discord ID
  const discordProfile = await getUser(accessToken)

  let userDoc =
    (await User.findOne({ discordId: discordProfile.id })) ||
    (await PartialUser.findOne({ discordId: discordProfile.id }))

  if (!userDoc) {
    const userDocResult = await createUser(
      accessToken,
      refreshToken,
      discordProfile.id
    )

    if (userDocResult.isOk()) {
      userDoc = userDocResult.value
    } else {
      console.error(userDocResult)
      return res
        .status(ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ error: userDocResult.error.message })
    }
  }

  const sessionId = await createNewSession(userDoc._id)
  setCookie({ res }, "session", sessionId, {
    httpOnly: true,
    secure: false,
    path: "/",
  })

  if (!Object.keys(userDoc).includes("username")) {
    userDoc.discordId = discordProfile.id

    await userDoc.save()

    return res.redirect("/profile/setup")
  }

  return res.redirect("/create")
})

export default handler
