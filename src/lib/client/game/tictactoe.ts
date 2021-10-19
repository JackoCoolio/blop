import { BaseGameInterface } from "Lib/client/game/base"

export type TicTacToePiece = "x" | "o" | ""

export interface TicTacToeState {
  board: TicTacToePiece[]
}

export interface TicTacToeGameInterface extends BaseGameInterface {
  type: "tictactoe"
  state: TicTacToeState
}
