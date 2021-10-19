import mongoose, { EnforceDocument } from "mongoose"
import { nanoid } from "nanoid"
import { GameInterface } from "Lib/client/game"
import { TicTacToeGameInterface } from "Lib/client/game/tictactoe"

const GameSchema = new mongoose.Schema<
  GameInterface,
  mongoose.Model<GameInterface>,
  GameInterface
>({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  type: {
    type: String,
    required: true,
    enum: ["tictactoe"],
  },
  players: [String],
  turn: {
    type: Number,
    default: 0,
  },
  created: {
    type: Date,
    default: () => new Date(),
  },
  state: mongoose.SchemaTypes.Mixed,
})

export default (mongoose.models.Game as mongoose.Model<GameInterface>) ||
  mongoose.model<GameInterface>("Game", GameSchema)

export async function createTicTacToeGame(
  players: string[]
): Promise<EnforceDocument<TicTacToeGameInterface, {}>> {
  return await mongoose.models.Game.create({
    type: "tictactoe",
    players,
    state: {
      board: ["", "", "", "", "", "", "", ""],
    },
  })
}
