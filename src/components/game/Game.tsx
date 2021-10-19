import { GameInterface } from "Lib/client/game"
import { Component } from "react"

export interface GameProps {
  game: GameInterface
  me: string
}

export class Game<S = {}> extends Component<GameProps, S> {}
