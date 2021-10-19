import fetch from "node-fetch"

export async function getUser(accessToken: string): Promise<any> {
  if (!process.env.DISCORD_CLIENT_ID) throw new Error("No client ID specified!")

  const response = await fetch("https://discord.com/api/v8/users/@me", {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + accessToken,
    },
  })

  const json = await response.json()

  return json
}
