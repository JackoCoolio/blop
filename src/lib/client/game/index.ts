import { TicTacToe } from "Lib/client/game/tictactoe"
import { Winners, isUsersTurn } from "./base"

// an array of game types
const gameTypes = ["tictactoe"] as const

export type GameType = typeof gameTypes[number]
export function isGameType(x: any): x is GameType {
  return gameTypes.includes(x)
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

export type GameState = TicTacToe.State
export type GameInterface = TicTacToe.GameInterface

export const winCheckers = {
  tictactoe: TicTacToe.getWinner,
}

/**
 * Returns the winners of the given game.
 * @param game a GameInterface that has a matching WinChecker in `winCheckers`
 * @returns an array of player indices
 */
export function getWinners(game: GameInterface): Winners {
  const checker = winCheckers[game.type]
  if (!checker) {
    return []
  } else {
    return checker(game)
  }
}

export { isUsersTurn }
