import {
  TicTacToeGameInterface,
  TicTacToeState,
} from "Lib/client/game/tictactoe"

// an array of game types
const gameTypes = ["tictactoe"] as const

export type GameType = typeof gameTypes[number]
export function isGameType(x: any): x is GameType {
  return gameTypes.includes(x)
}

export function isUsersTurn(userId: string, game: GameInterface): boolean {
  return game.players[game.turn % game.players.length] === userId
}

export interface PrettyGameType {
  title: string
  description: string
}

export function getPrettyGameType(type: string): PrettyGameType {
  switch (type) {
    case "tictactoe":
      return {
        title: "Tic-Tac-Toe",
        description:
          "A two-player game that rarely ends in anything but a draw.",
      }
    default:
      return {
        title: "Unknown",
        description: "",
      }
  }
}

export type GameState = TicTacToeState
export type GameInterface = TicTacToeGameInterface
