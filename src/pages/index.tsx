import Head from "next/head"
import { Component } from "react"
import styles from "Styles/Home.module.scss"
import fetch from "node-fetch"
import Logo from "public/blop.svg"

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

  getLogoArray() {
    const logos = []
    const colors = [
      "var(--blop-yellow)",
      "var(--blop-green)",
      "var(--blop-red)",
      "var(--blop-blue)",
      "var(--blop-white)",
    ]

    // how much the logos are offset from each other
    const scale = 0.75
    for (let i = 0; i < colors.length; i++) {
      // some fancy math to ensure that the final stacked logos are centered
      const offset = scale * (2 * i - (colors.length - 1))
      logos.push(
        <div
          key={i}
          className={styles.bgLogoContainer}
          style={{
            zIndex: i,
            left: offset + "vh",
          }}
        >
          <Logo
            className={styles.bgLogo}
            style={{
              fill: colors[i],
            }}
          />
        </div>
      )
    }

    return logos
  }

  render() {
    return (
      <div id={styles.main}>
        <Head>
          <title>Blop</title>
          <meta name="description" content="Blop!" />
        </Head>

        <div id={styles.bgLogos}>{this.getLogoArray()}</div>

        <h1 id={styles.subtitle}>
          your favorite ta
          <span className={styles.blue}>b</span>
          <span className={styles.red}>l</span>
          et
          <span className={styles.green}>o</span>
          <span className={styles.yellow}>p</span> games, in one place!
        </h1>
      </div>
    )
  }
}
