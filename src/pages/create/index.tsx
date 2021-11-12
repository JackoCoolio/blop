import styles from "Styles/CreateGamePage.module.scss"
import { withRouter, Router } from "next/router"
import React, { Component } from "react"
import { GameType } from "Lib/client/game"
import { GameTypeCard, GameMetadata } from "Components/GameTypeCard"
import { InviteListItem } from "Components/InviteListItem"
import update from "immutability-helper"
import fetch from "node-fetch"
import { parseCookies } from "nookies"
import { isSessionLoggedIn } from "Lib/server/session"
import { Button } from "Components/Button"
import { Search, SearchResult } from "Components/Search"

const games: GameMetadata[] = [
  {
    title: "Tic-Tac-Toe",
    code: "tictactoe",
    description: "A two-player game that rarely ends in anything but a draw.",
    minPlayers: 2,
    maxPlayers: 2,
  },
]

interface Invitee {
  id: string
  username: string
}

interface CreatePageProps {
  router: Router
}

interface CreatePageState {
  selectedGameType?: GameType
  selectedCard?: number
  invitees: Invitee[]
  minAllowedInvites: number
  maxAllowedInvites: number
}

class CreatePage extends Component<CreatePageProps, CreatePageState> {
  constructor(props: any) {
    super(props)

    this.state = {
      minAllowedInvites: 0,
      maxAllowedInvites: 0,

      invitees: [],
    }

    this.createGameAndSendInvites = this.createGameAndSendInvites.bind(this)
  }

  async createGameAndSendInvites(): Promise<void> {
    // create the game
    var createGameResponse = await fetch("/api/game/create", {
      method: "post",
      body: JSON.stringify({
        type: this.state.selectedGameType,
      }),
    }).then(x => x.json())

    const gameId = createGameResponse.id

    // send the invites
    await fetch("/api/invite/create", {
      method: "post",
      body: JSON.stringify({
        invitees: this.state.invitees.map(x => x.id),
        gameId,
      }),
    })

    // redirect to the new game
    this.props.router.push(`/game/${gameId}`)
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
          name={invitee.username}
          onDelete={() => {
            const newState = update(this.state, {
              invitees: {
                $apply: function (arr: Invitee[]) {
                  return arr.filter(x => x.username !== invitee.username)
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
        <div>
          <div id={styles.settingsContainer}>
            <h1>Game Setup</h1>

            {inviteCards.length === 0 || <h2>Invitees</h2>}

            {inviteCards}
            <Search
              color="blue"
              promptText="Invite friends..."
              id={styles.searchBar}
              search={async query => {
                const searchRequestResult = await fetch("/api/search", {
                  method: "post",
                  body: JSON.stringify({
                    query,
                    limit: 5,
                    scope: {
                      group: "friends",
                      exclude: {
                        me: true,
                        friends: false,
                        users: this.state.invitees.map(x => x.id),
                      },
                    },
                  }),
                }).then(x => x.json())

                // create array of search results
                const formattedResults: SearchResult[] =
                  searchRequestResult.matches.map((result: any) => {
                    return {
                      displayText: result.username,
                      onSelect: async () => {
                        // when a user is selected add them to the invitees list
                        this.setState(
                          update(this.state, {
                            invitees: {
                              $push: [
                                {
                                  id: result.id,
                                  username: result.username,
                                },
                              ],
                            },
                          })
                        )
                      },
                    }
                  })

                return formattedResults
              }}
              searchInterval={1000}
            />
            <Button
              disabled={!this.state.selectedGameType}
              color="red"
              onClick={async () => {
                await this.createGameAndSendInvites()
              }}
              id={styles.startButton}
            >
              Start
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export async function getServerSideProps({ req }: any) {
  const { session } = parseCookies({ req })
  const isLoggedIn = await isSessionLoggedIn(session)

  if (!isLoggedIn) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default withRouter(CreatePage)
