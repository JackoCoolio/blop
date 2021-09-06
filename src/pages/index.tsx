import Head from "next/head"
import { Component } from "react"
// import styles from "Styles/Home.module.scss"
import fetch from "node-fetch"
// import AppContainer from "Components/AppContainer"

interface HomeState {
  loggedIn: boolean
}

export default class Home extends Component<unknown, HomeState> {
  constructor(props: any) {
    super(props)

    this.state = {
      loggedIn: true,
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
    return (
      <>
        <Head>
          <title>Blop</title>
          <meta name="description" content="Blop!" />
        </Head>

        <main>
          <h1>Blop</h1>
        </main>

        {/* <h1>Blop</h1>

        <p>
          {this.state.loggedIn ? `You're logged in!` : `Login with Discord!`}
        </p>

        <div>
          <a
            href={process.env.DISCORD_AUTH_URL}
            hidden={this.state.loggedIn}
          >
            <h2>Login with Discord &rarr;</h2>
            <p>Blop uses Discord for user authentication.</p>
          </a>
          <Link href="/dashboard">
            <a>
              <h2>Dashboard &rarr;</h2>
              <p>
                Go to your dashboard, where you can see the list of games you
                are currently playing.
              </p>
            </a>
          </Link>
        </div> */}
      </>
    )
  }
}
