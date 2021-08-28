import { withRouter, Router } from "next/router"
import { Component } from "react"
import fetch from "node-fetch"
import AppContainer from "Components/AppContainer"

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

    // have to do this because React is weird
    this.createGame = this.createGame.bind(this)
  }

  async createGame() {
    const body = {
      type: this.gameSelect?.value,
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
    return (
      <AppContainer>
        <p>Welcome!</p>
        <select
          ref={element => {
            this.gameSelect = element!
          }}
        >
          <option value="tictactoe">Tic-Tac-Toe</option>
          <option value="invalid">Invalid</option>
        </select>
        <button onClick={this.createGame}>Create Game</button>
      </AppContainer>
    )
  }
}

export default withRouter(Dashboard)
