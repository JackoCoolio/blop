import styles from "Styles/BlopNavbar.module.scss"
import Link from "next/link"
import { Component } from "react"
import fetch from "node-fetch"
import Logo from "../../public/blop.svg"
import Dashboard from "../../public/dashboard.svg"
import Profile from "../../public/profile.svg"
import Settings from "../../public/settings.svg"
import CreateGame from "../../public/plus.svg"
import GithubLogo from "../../public/github.svg"

interface NavbarState {
  loggedIn: boolean
}

export class BlopNavbar extends Component<unknown, NavbarState> {
  constructor(props: any) {
    super(props)

    this.state = {
      loggedIn: false,
    }
  }

  async componentDidMount() {
    try {
      const res = await fetch("/api/session", {
        method: "get",
      })

      const json = await res.json()

      this.setState({
        loggedIn: json.loggedIn,
      })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { loggedIn } = this.state

    return (
      <nav className={styles.main}>
        <div className={styles.container}>
          <Link href="/create">
            <a className={styles.link}>
              <div
                className={`${styles.button} ${styles.navElement}`}
                id={styles.createGame}
              >
                <CreateGame className={styles.icon} />
              </div>
            </a>
          </Link>
          <Link href="/dashboard">
            <a className={styles.link} onDrag={() => false}>
              <div
                className={`${styles.button} ${styles.navElement}`}
                id={styles.dashboard}
              >
                <Dashboard className={styles.icon} />
              </div>
            </a>
          </Link>
          <Link href="/">
            <a className={styles.link} draggable={false}>
              <div
                className={styles.navElement}
                id={styles.logoButton}
                draggable={false}
              >
                <Logo className={styles.icon} draggable={false} />
              </div>
            </a>
          </Link>
          <Link href={loggedIn ? "/profile" : "/login"}>
            <a className={styles.link}>
              <div
                className={`${styles.button} ${styles.navElement}`}
                id={styles.profile}
              >
                <Profile className={styles.icon} />
              </div>
            </a>
          </Link>
          <Link href="/settings">
            <a className={styles.link}>
              <div
                className={`${styles.button} ${styles.navElement}`}
                id={styles.settings}
              >
                <Settings className={styles.icon} />
              </div>
            </a>
          </Link>
        </div>
        <div id={styles.rightContainer}>
          <a href="https://github.com/JackoCoolio/blop">
            <GithubLogo id={styles.githubButton} />
          </a>
        </div>
      </nav>
    )
  }
}
