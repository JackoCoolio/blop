import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { setCookie } from "nookies"
import { getUser } from "Lib/discord"
import { isVerifiedEnv } from "Lib/env"
import User from "Models/User"
import { createNewSession } from "Lib/session"

const handler = nextConnect()

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.url) throw new Error("No URL!")

  if (!isVerifiedEnv(process.env)) throw new Error(".env is missing a value!")

  const url = new URL(req.url, `http://${req.headers.host}`)
  const params = url.searchParams

  const code = params.get("code")
  if (!code) {
    return res.redirect("/")
  }

  const body = new URLSearchParams()
  body.append("client_id", process.env.DISCORD_CLIENT_ID)
  body.append("client_secret", process.env.DISCORD_CLIENT_SECRET)
  body.append("grant_type", "authorization_code")
  body.append("code", code)
  body.append("redirect_uri", process.env.REDIRECT_URI)

  try {
    var response = await fetch("https://discord.com/api/oauth2/token", {
      method: "post",
      body: body.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  } catch (e) {
    return console.error(e)
  }

  response.json().then(async json => {
    const accessToken = json["access_token"]
    const refreshToken = json["refresh_token"]

    try {
      var profile = await getUser(accessToken)
    } catch (e) {
      return res.redirect("/")
    }

    // find the user with the given discord ID
    var userDoc = await User.findOne({ discordId: profile.id })

    // get that user's discord ID if they exist
    var userId = userDoc?._id

    if (!userDoc) {
      userDoc = await User.create({
        discordId: profile.id,
        refreshToken,
      })
      userId = userDoc._id
    } else {
      await User.updateOne(
        {
          discordId: profile.id,
        },
        {
          $set: { refreshToken },
        }
      )
    }

    // create a new session
    const sessionId = await createNewSession(userId)

    // set the cookie (and make it httpOnly)
    setCookie({ res }, "session", sessionId, {
      httpOnly: true,
      secure: false,
      path: "/",
    })

    // go to dashboard
    res.redirect("/dashboard")
  })
})

export default handler
