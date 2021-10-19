import { Component } from "react"
import AppContainer from "Components/AppContainer"
import fetch from "node-fetch"
import { GameInterface } from "Lib/client/game"
import { TicTacToe } from "Components/game/TicTacToe"

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
      fetch(`/api/game/${this.props.gameId}`, {
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
          <TicTacToe game={this.state.gameInformation} me={this.state.me!} />
        )
    }

    return (
      <AppContainer>
        {this.state.loaded ? gameComponent : <h1>Loading...</h1>}
      </AppContainer>
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
