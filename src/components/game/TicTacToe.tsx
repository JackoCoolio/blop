import styles from "Styles/TicTacToe.module.scss"
import { Game, GameProps } from "Components/game/Game"
import fetch from "node-fetch"
import { TicTacToe } from "Lib/client/game/tictactoe"
import XSvg from "../../../public/ttt-x.svg"
import OSvg from "../../../public/ttt-o.svg"

interface TicTacToeState {
  game: TicTacToe.GameInterface // i forsee this being an issue, once i add more games
}

export class TicTacToeComponent extends Game<TicTacToeState> {
  constructor(props: GameProps) {
    super(props)

    this.state = {
      game: props.game,
    }
  }

  async makeMove(index: number) {
    if (
      !this.state.game.myTurn ||
      !TicTacToe.isValidMove(this.state.game, index)
    )
      return

    const newState = TicTacToe.applyMove(this.state.game, index)

    this.setState({ game: newState })

    await fetch(`/api/game/${this.state.game._id}/state`, {
      method: "PATCH",
      body: JSON.stringify(index),
    })
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
            await this.makeMove.bind(this)(i)
          }}
        >
          {content}
        </div>
      )
    }

    return <div className={styles.ttt}>{squares}</div>
  }
}
