import styles from "Styles/CreateGamePage.module.scss"
import { withRouter, Router } from "next/router"
import { Component } from "react"
import { GameType } from "Lib/game"
import { GameCard } from "Components/GameCard"

interface GameMetadata {
  title: string
  code: GameType
  description: string
  numPlayers: string
}

const games: GameMetadata[] = [
  {
    title: "Tic-Tac-Toe",
    code: "tictactoe",
    description: "A two-player game that rarely ends in anything but a draw.",
    numPlayers: "2",
  },
]

interface CreatePageProps {
  router: Router
}

interface CreatePageState {
  selectedGameType?: GameType
  selectedCard?: number
}

class CreatePage extends Component<CreatePageProps, CreatePageState> {
  constructor(props: any) {
    super(props)

    this.state = {}

    this.createGame = this.createGame.bind(this)
  }

  async createGame() {
    const body = {
      type: this.state.selectedGameType,
    }

    try {
      var response = await fetch("/api/game/create", {
        method: "post",
        body: JSON.stringify(body),
      })
    } catch (e) {
      return console.error(e)
    }

    // get the ID of the created game
    const { id } = await response.json()

    // redirect to the new game
    this.props.router.push(`/game/${id}`)
  }

  render() {
    const testItems = []
    for (let i = 0; i < 50; i++) {
      // make multiple tictactoes for testing
      // this will switch to games[i] when new games are added
      const game = games[0]

      testItems.push(
        <GameCard
          key={i}
          metadata={game}
          selected={i === this.state.selectedCard}
          onClick={code => {
            this.setState({
              selectedGameType: code,
              selectedCard: i,
            })
          }}
        ></GameCard>
      )
    }

    return (
      <div id={styles.main}>
        <div id={styles.listPane}>{testItems}</div>
        <div id={styles.settingsPane}>
          Settings
          <button
            id={styles.startButton}
            className={!this.state.selectedGameType ? styles.disabled : ""}
            onClick={async () => {
              await this.createGame()
            }}
          >
            Start
          </button>
        </div>
      </div>
    )
  }
}

export default withRouter(CreatePage)
