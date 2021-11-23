import styles from "Styles/Dashboard.module.scss"
import { withRouter, Router } from "next/router"
import { Component } from "react"
import { parseCookies } from "nookies"
import { isSessionLoggedIn } from "Lib/server/session"
import fetch from "node-fetch"
import { GameType, getPrettyGameType } from "Lib/client/game"
import YesNo from "Components/YesNo"
import { ResponseCode } from "Lib/server/util"

interface DashboardProps {
  router: Router
}

interface Invite {
  id: string
  game: {
    id: string
    type: GameType
  }
  inviter: {
    userId: string
    username: string
  }
}

interface DashboardState {
  invites: Invite[]
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props)

    this.state = {
      invites: [],
    }
  }

  async componentDidMount() {
    // fetch pending invites
    const invitesData: any[] = await fetch("/api/invite/getPending").then(x =>
      x.json()
    )

    console.log(invitesData)

    // format invite response
    const invites: Invite[] = await Promise.all(
      invitesData.map<Promise<Invite>>(async invite => {
        // get metadata about the game
        const gameMetadata = await fetch(
          `/api/game/${invite.gameId}/metadata`
        ).then(x => x.json())

        return {
          id: invite.id,
          game: {
            id: invite.gameId,
            type: gameMetadata.type,
          },
          inviter: {
            userId: invite.inviter,
            username: (
              await fetch(`/api/user?id=${invite.inviter}`, {
                method: "get",
              }).then(x => x.json())
            ).username,
          },
        }
      })
    )

    this.setState({
      invites,
    })
  }

  render() {
    const inviteCards = []
    for (const invite of this.state.invites) {
      inviteCards.push(
        <div className={styles.inviteCard}>
          <h2>{getPrettyGameType(invite.game.type).title}</h2>
          <p>
            <span>Invited by </span>
            <span>{invite.inviter.username}</span>
          </p>
          <YesNo
            onYes={async () => {
              const acceptResponse = await fetch("/api/invite/respond", {
                method: "post",
                body: JSON.stringify({
                  inviteId: invite.id,
                  response: "accept",
                }),
              })

              if (acceptResponse.status === ResponseCode.OK) {
                this.props.router.push(`/game/${invite.game.id}`)
              }
            }}
            onNo={async () => {
              await fetch("/api/invite/respond", {
                method: "post",
                body: JSON.stringify({
                  inviteId: invite.id,
                  response: "decline",
                }),
              })
            }}
          />
        </div>
      )
    }

    const gameCards = []
    for (let i = 0; i < 4; i++) {
      gameCards.push(
        <div className={styles.gameCard} key={i}>
          <h1>Game Name</h1>
          <span>Your move!</span>
        </div>
      )
    }

    return (
      <div id={styles.main}>
        <div id={styles.invitesPane}>
          <div className={styles.paneHeader}>
            <h1>Pending Invites</h1>
          </div>
          <div id={styles.invitesListContainer}>
            <div id={styles.invitesList}>{inviteCards}</div>
          </div>
        </div>
        <div id={styles.paneDivider} />
        <div id={styles.gamesPane}>
          <div className={styles.paneHeader}>
            <h1>Ongoing Games</h1>
          </div>
          <div id={styles.gamesGalleryContainer}>
            <div id={styles.gamesGallery}>{gameCards}</div>
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

export default withRouter(Dashboard)
