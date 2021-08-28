import { Component } from "react"
import AppContainer from "Components/AppContainer"
import fetch from "node-fetch"
import { GameInterface } from "Lib/game"
import { TicTacToe } from "Components/game/TicTacToe"

interface GameHandlerComponentProps {
  gameId: string
}

interface GameHandlerComponentState {
  loaded: boolean
  gameInformation?: GameInterface
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
    const response = await fetch(`/api/game/${this.props.gameId}`, {
      method: "get",
    })

    try {
      var gameInformation = await response.json()
    } catch (e) {
      return console.error(`This game doesn't exist!`)
    }

    this.setState({ gameInformation, loaded: true })
  }

  render() {
    // find correct game component
    let gameComponent
    switch (this.state.gameInformation?.type) {
      case "tictactoe":
        gameComponent = <TicTacToe game={this.state.gameInformation} />
    }

    return (
      <AppContainer>
        <h1>{this.state.loaded ? gameComponent : "Loading..."}</h1>
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
