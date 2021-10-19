import styles from "Styles/GameCard.module.scss"
import { GameType } from "Lib/client/game"
import { Component } from "react"
import classNames from "classnames"

type GameTypeCardOnClick = (metadata: GameMetadata, self: GameTypeCard) => void

export interface GameMetadata {
  title: string
  code: GameType
  description: string
  minPlayers: number
  maxPlayers: number
}

interface GameTypeCardProps {
  metadata: GameMetadata
  onClick?: GameTypeCardOnClick
  selected: boolean
}

export class GameTypeCard extends Component<GameTypeCardProps> {
  constructor(props: GameTypeCardProps) {
    super(props)
  }

  render(): JSX.Element {
    const { minPlayers, maxPlayers } = this.props.metadata
    let players
    if (minPlayers === maxPlayers) {
      players = "" + minPlayers
    } else {
      players = minPlayers + " - " + maxPlayers
    }

    return (
      <a
        onClick={() => {
          if (this.props.onClick) this.props.onClick(this.props.metadata, this)
        }}
      >
        <div
          className={classNames(styles.main, {
            [styles.selected]: this.props.selected,
          })}
        >
          <h1>{this.props.metadata.title}</h1>
          <p>{this.props.metadata.description}</p>
          <p>Players: {players}</p>
        </div>
      </a>
    )
  }
}
