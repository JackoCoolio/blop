import styles from "Styles/GameCard.module.scss"
import { GameType } from "Lib/game"
import { Component } from "react"
import update from "immutability-helper"
import classNames from "classnames"

type GameCardOnClick = (code: GameType, self: GameCard) => void

export interface GameMetadata {
  title: string
  code: GameType
  description: string
  numPlayers: string
}

interface GameCardProps {
  metadata: GameMetadata
  onClick?: GameCardOnClick
  selected: boolean
}

export class GameCard extends Component<GameCardProps> {
  constructor(props: GameCardProps) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <a
        onClick={() => {
          if (this.props.onClick)
            this.props.onClick(this.props.metadata.code, this)
        }}
      >
        <div
          className={classNames(styles.main, {
            [styles.selected]: this.props.selected,
          })}
        >
          <h1>{this.props.metadata.title}</h1>
          <p>{this.props.metadata.description}</p>
          <p>Players: {this.props.metadata.numPlayers}</p>
        </div>
      </a>
    )
  }
}
