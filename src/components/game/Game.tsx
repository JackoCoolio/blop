import { GameInterface } from "Lib/game"
import { Component } from "react"

interface GameProps {
  game: GameInterface
}

export class Game extends Component<GameProps, unknown> {}
