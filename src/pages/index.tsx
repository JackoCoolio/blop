import Head from "next/head"
import { Component } from "react"
import styles from "Styles/Home.module.scss"
import fetch from "node-fetch"
import Logo from "public/blop.svg"
import styled, { keyframes } from "styled-components"
import { Button } from "Components/Button"
import { Router, withRouter } from "next/router"

interface HomeProps {
  router: Router
}

interface HomeState {
  loggedIn: boolean
}

class Home extends Component<HomeProps, HomeState> {
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

      const slideAnimation = keyframes`
        0% {
          transform: translateX(0);
        }

        80% {
          transform: translateX(${offset * 1.25}vh) scaleY(0.75);
        }

        100% {
          transform: translateX(${offset}vh);
        }
      `

      const LogoContainer = styled.div`
        zindex: ${i};
        animation: ${slideAnimation} 1s cubic-bezier(0.25, 1, 0.75, 1.5);
        animation-fill-mode: forwards;
        animation-delay: 0.5s;
      `

      logos.push(
        <LogoContainer key={i} className={styles.bgLogoContainer}>
          {i == 0 ? (
            <div id={styles.subtitleContainer}>
              <h1 id={styles.subtitle}>
                your favorite{" "}
                <span>
                  ta
                  <span className={styles.blue}>b</span>
                  <span className={styles.red}>l</span>
                  et
                  <span className={styles.green}>o</span>
                  <span className={styles.yellow}>p</span>
                </span>{" "}
                games
              </h1>
            </div>
          ) : undefined}

          <Logo
            className={styles.bgLogo}
            style={{
              fill: colors[i],
            }}
          />
        </LogoContainer>
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

        <Button
          color="green"
          href="/login"
          style={{
            position: "relative",
            top: "5%",
          }}
        >
          Get started!
        </Button>
      </div>
    )
  }
}

export default withRouter(Home)
