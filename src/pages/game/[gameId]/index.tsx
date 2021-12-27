import styles from "Styles/GameHandler.module.scss"
import { Component } from "react"
import AppContainer from "Components/AppContainer"
import fetch from "node-fetch"
import { GameInterface } from "Lib/client/game"
import { TicTacToeComponent } from "Components/game/TicTacToe"
import { Modal } from "Components/Modal"
import { Button } from "Components/Button"

interface GameHandlerComponentProps {
  gameId: string
}

interface GameHandlerComponentState {
  loaded: boolean
  gameInformation?: GameInterface
  me?: string
}

class GameHandler extends Component<
  GameHandlerComponentProps,
  GameHandlerComponentState
> {
  constructor(props: GameHandlerComponentProps) {
    super(props)

    this.state = {
      loaded: false,
    }
  }

  async componentDidMount() {
    const [gameResponse, userResponse] = await Promise.all([
      fetch(`/api/game/${this.props.gameId}/state`, {
        method: "get",
      }),
      fetch(`/api/session`, {
        method: "get",
      }),
    ])

    try {
      var gameInformation = await gameResponse.json()
      var { userId } = await userResponse.json()
    } catch (e) {
      return console.error(`This game doesn't exist!`)
    }

    this.setState({ gameInformation, me: userId, loaded: true })
  }

  render() {
    // find correct game component
    let gameComponent
    switch (this.state.gameInformation?.type) {
      case "tictactoe":
        // we can assume that this.state.me is defined, because it is defined at the same time as gameInformation
        gameComponent = (
          <TicTacToeComponent
            game={this.state.gameInformation}
            me={this.state.me!}
          />
        )
    }

    let modal
    if (!!this.state.gameInformation) {
      if (this.state.gameInformation.winners.length > 0) {
        const winner = this.state.gameInformation.winners[0]
        if (this.state.gameInformation.players[winner] === this.state.me) {
          modal = (
            <Modal color="green" allowHide>
              <div id={styles.modalContents}>
                <h1>You won!</h1>
                <Button color="blue" href="/create">
                  Play again
                </Button>
              </div>
            </Modal>
          )
        } else {
          modal = (
            <Modal color="red" allowHide>
              <div id={styles.modalContents}>
                <h1>You lost!</h1>
                <Button color="blue" href="/create">
                  Play again
                </Button>
              </div>
            </Modal>
          )
        }
      }
    }

    return (
      <>
        {modal}
        <AppContainer>
          {this.state.loaded ? gameComponent : <h1>Loading...</h1>}
        </AppContainer>
      </>
    )
  }
}

export default GameHandler

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      gameId: ctx.query.gameId,
    },
  }
}
