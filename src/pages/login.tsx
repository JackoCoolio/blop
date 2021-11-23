import { isSessionLoggedIn } from "Lib/server/session"
import { parseCookies } from "nookies"

// next.js complains about exporting functions with no name
const nothing = () => null
export default nothing

export async function getServerSideProps({ req }: any) {
  const { session } = parseCookies({ req })
  const isLoggedIn = await isSessionLoggedIn(session)

  if (!isLoggedIn) {
    // if user isn't logged in, redirect them to discord login
    // in the future, I might add more authentication methods,
    // in which case I'll add an actual page here and not just redirects
    return {
      redirect: {
        permanent: false,
        destination: process.env.DISCORD_AUTH_URL!,
      },
    }
  } else {
    // if user is logged in, redirect them to dashboard
    return {
      redirect: {
        permanent: false,
        destination: "/dashboard",
      },
    }
  }
}
