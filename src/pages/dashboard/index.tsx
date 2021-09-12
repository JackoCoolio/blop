import styles from "Styles/Dashboard.module.scss"
import { withRouter, Router } from "next/router"
import { Component } from "react"

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

export default withRouter(Dashboard)
