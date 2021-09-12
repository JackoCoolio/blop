import styles from "Styles/CreateGamePage.module.scss"
import { withRouter, Router } from "next/router"
import React, { Component, KeyboardEvent } from "react"
import { GameType } from "Lib/game"
import { GameTypeCard, GameMetadata } from "Components/GameTypeCard"
import { InviteListItem } from "Components/InviteListItem"
import update from "immutability-helper"
import fetch from "node-fetch"

const games: GameMetadata[] = [
  {
    title: "Tic-Tac-Toe",
    code: "tictactoe",
    description: "A two-player game that rarely ends in anything but a draw.",
    minPlayers: 2,
    maxPlayers: 2,
  },
]

interface CreatePageProps {
  router: Router
}

interface CreatePageState {
  selectedGameType?: GameType
  selectedCard?: number
  invitees: string[]
  minAllowedInvites: number
  maxAllowedInvites: number
  inviteField: React.RefObject<HTMLInputElement> | null
}

class CreatePage extends Component<CreatePageProps, CreatePageState> {
  constructor(props: any) {
    super(props)

    this.state = {
      minAllowedInvites: 0,
      maxAllowedInvites: 0,
      inviteField: null,

      // testing purposes
      invitees: [],
      selectedCard: 0,
      selectedGameType: "tictactoe",
    }

    this.createGame = this.createGame.bind(this)
    this.handleInputKey = this.handleInputKey.bind(this)
  }

  async createGame() {
    try {
      var response = await fetch("/api/game/create", {
        method: "post",
        body: JSON.stringify({
          type: this.state.selectedGameType,
        }),
      })
    } catch (e) {
      return console.error(e)
    }

    // get the ID of the created game
    const { id } = await response.json()

    try {
      await fetch("/api/invite/create", {
        method: "post",
        body: JSON.stringify({
          invitees: this.state.invitees,
          gameId: id,
        }),
      })
    } catch (e) {
      return console.error(e)
    }

    // redirect to the new game
    this.props.router.push(`/game/${id}`)
  }

  handleInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // add the user to the list
      const newState = update(this.state, {
        invitees: {
          $push: [e.currentTarget.value],
        },
      })
      this.setState(newState)

      // clear the input field
      e.currentTarget.value = ""
    }
  }

  render() {
    const testItems = []
    for (let i = 0; i < 50; i++) {
      // make multiple tictactoes for testing
      // this will switch to games[i] when new games are added
      const game = games[0]

      testItems.push(
        <GameTypeCard
          key={i}
          metadata={game}
          selected={i === this.state.selectedCard}
          onClick={metadata => {
            this.setState({
              selectedGameType: metadata.code,
              selectedCard: i,
              minAllowedInvites: metadata.minPlayers - 1,
              maxAllowedInvites: metadata.maxPlayers - 1,
            })
          }}
        ></GameTypeCard>
      )
    }

    const inviteCards = []
    for (let i = 0; i < this.state.invitees.length; i++) {
      const invitee = this.state.invitees[i]

      inviteCards.push(
        <InviteListItem
          key={i}
          name={invitee}
          onDelete={name => {
            const newState = update(this.state, {
              invitees: {
                $apply: function (arr: string[]) {
                  return arr.filter(x => x !== name)
                },
              },
            })
            this.setState(newState)
          }}
        />
      )
    }

    return (
      <div id={styles.main}>
        <div id={styles.listPane}>{testItems}</div>
        <div id={styles.settingsPane}>
          <h1>Game Setup</h1>

          <h2>Invite Players:</h2>
          <input
            type="text"
            id={styles.inviteField}
            onKeyDown={this.handleInputKey}
          ></input>
          {inviteCards}
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
