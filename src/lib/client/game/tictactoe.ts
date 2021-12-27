import { BaseGameInterface } from "Lib/client/game/base"
import update from "immutability-helper"
import { isUsersTurn } from "./base"

export namespace TicTacToe {
  export type Piece = "x" | "o" | ""

  export interface State {
    board: Piece[]
  }

  export interface GameInterface extends BaseGameInterface {
    type: "tictactoe"
    state: State
  }

  function getTurnOfPiece(piece: Piece): number {
    return {
      x: 0,
      o: 1,
      "": -1,
    }[piece]
  }

  function getWinnerOfLine(
    board: Piece[],
    a: number,
    b: number,
    c: number
  ): Piece | null {
    if (board[a] === board[b] && board[b] === board[c] && board[c] != "") {
      return board[c]
    }
    return null
  }

  export function getWinner(game: GameInterface): number[] {
    let piece =
      getWinnerOfLine(game.state.board, 0, 1, 2) ||
      getWinnerOfLine(game.state.board, 0, 3, 6) ||
      getWinnerOfLine(game.state.board, 3, 4, 5) ||
      getWinnerOfLine(game.state.board, 1, 4, 7) ||
      getWinnerOfLine(game.state.board, 0, 4, 8) ||
      getWinnerOfLine(game.state.board, 2, 4, 6) ||
      getWinnerOfLine(game.state.board, 6, 7, 8) ||
      getWinnerOfLine(game.state.board, 2, 5, 8)

    if (!piece) {
      return []
    } else {
      const turn = getTurnOfPiece(piece)
      return [turn, (turn + 1) % 2]
    }
  }

  export function isValidMove(
    game: GameInterface,
    move: number,
    userId?: string
  ): boolean {
    // in bounds
    if (move < 0 || move > 8) return false

    // not on an existing piece
    if (game.state.board[move] !== "") return false

    if (!!userId && !isUsersTurn(userId, game)) return false

    // if there is a winner, you can't keep playing
    if (getWinner(game).length > 0) return false

    return true
  }

  export function applyMove(game: GameInterface, move: number): any {
    // we can assume the move is valid

    const pieces: Piece[] = ["x", "o"]
    const piece = pieces[game.turn % 2]

    return update(game, {
      state: {
        board: {
          [move]: {
            $set: piece,
          },
        },
      },
      turn: {
        $apply: t => t + 1,
      },
      myTurn: {
        $set: false,
      },
    })
  }
}
