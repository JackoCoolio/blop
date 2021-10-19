import styles from "Styles/Dashboard.module.scss"
import { withRouter, Router } from "next/router"
import { Component } from "react"
import { parseCookies } from "nookies"
import { isSessionLoggedIn } from "Lib/server/session"

interface DashboardProps {
  router: Router
}

interface DashboardState {
  gameSelect: React.Ref<HTMLSelectElement>
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  gameSelect: HTMLSelectElement | undefined

  constructor(props: DashboardProps) {
    super(props)
  }

  render() {
    return (
      <div id={styles.main}>
        <div id={styles.invitesPane}>
          <h1>Invites</h1>
        </div>
        <div id={styles.gamesPane}>
          <h1>Games</h1>
        </div>
      </div>
    )
  }
}

export async function getServerSideProps({ req, res, router }: any) {
  const { session } = parseCookies({ req })
  const isLoggedIn = await isSessionLoggedIn(session)

  if (!isLoggedIn) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default withRouter(Dashboard)
