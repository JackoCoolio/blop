import styles from "Styles/TicTacToe.module.scss"
import { Game, GameProps } from "Components/game/Game"
import fetch from "node-fetch"
import { TicTacToeGameInterface } from "Lib/client/game/tictactoe"
import { isUsersTurn } from "Lib/client/game"
import update from "immutability-helper"
import XSvg from "../../../public/ttt-x.svg"
import OSvg from "../../../public/ttt-o.svg"

interface TicTacToeState {
  game: TicTacToeGameInterface // i forsee this being an issue, once i add more games
  myTurn: boolean
}

export class TicTacToe extends Game<TicTacToeState> {
  constructor(props: GameProps) {
    super(props)

    this.state = {
      game: props.game,
      myTurn: isUsersTurn(props.me, props.game),
    }
  }

  render() {
    const squares = []

    for (let i = 0; i < 9; i++) {
      const sq = this.state.game.state.board[i]

      let content
      if (sq === "x") {
        content = <XSvg className={styles.x}></XSvg>
      } else if (sq === "o") {
        content = <OSvg className={styles.o}></OSvg>
      }

      squares.push(
        <div
          key={i}
          className={styles.square}
          onClick={async () => {
            if (!this.state.myTurn) return

            const piece = "x"

            // update state
            const newBoard = [...this.state.game.state.board]
            newBoard[i] = piece

            const newState = update(this.state, {
              game: {
                state: {
                  board: {
                    $set: newBoard,
                  },
                },
              },
              myTurn: {
                // toggle
                $set: false,
              },
            })
            this.setState(newState)

            // update in the API
            await fetch(`/api/game/${this.state.game._id}`, {
              method: "PATCH",
              body: JSON.stringify({
                board: newBoard,
              }),
            })
          }}
        >
          {content}
        </div>
      )
    }

    return <div className={styles.ttt}>{squares}</div>
  }
}
