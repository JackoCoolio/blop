import {
  TicTacToeGameInterface,
  TicTacToeState,
} from "Lib/client/game/tictactoe"

export type GameType = "tictactoe"
export function isGameType(x: any): x is GameType {
  return ["tictactoe"].includes(x)
}

export function isUsersTurn(userId: string, game: GameInterface): boolean {
  return game.players[game.turn % game.players.length] === userId
}

export type GameState = TicTacToeState
export type GameInterface = TicTacToeGameInterface
