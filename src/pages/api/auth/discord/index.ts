import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { setCookie } from "nookies"
import { getUser } from "Lib/discord"
import { isVerifiedEnv } from "Lib/env"
import User from "Models/User"
import { createNewSession } from "Lib/session"
import { createUser } from "Lib/userSetup"
import { ResponseCode } from "Lib/util"
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

  var userDoc =
    (await User.findOne({ refreshToken })) ||
    (await PartialUser.findOne({ refreshToken }))

  if (!userDoc) {
    const userDocResult = await createUser(refreshToken)
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
    // set up new user
    res.redirect("/profile/setup")

    const discordProfile = await getUser(accessToken)

    userDoc.discordId = discordProfile.id

    await userDoc.save()
  } else {
    res.redirect("/dashboard")
  }
})

export default handler
