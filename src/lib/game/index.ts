import { TicTacToeGameInterface } from "Lib/game/tictactoe"

export type GameType = "tictactoe"
export function isGameType(x: any): x is GameType {
  return ["tictactoe"].includes(x)
}

export type GameInterface = TicTacToeGameInterface
