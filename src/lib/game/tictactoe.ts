import { BaseGameInterface } from "Lib/game/base"

export type TicTacToePiece = "x" | "o" | ""

export interface TicTacToeState {
  board: TicTacToePiece[]
}

export interface TicTacToeGameInterface extends BaseGameInterface {
  type: "tictactoe"
  state: TicTacToeState
}
