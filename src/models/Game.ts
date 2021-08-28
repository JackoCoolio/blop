import mongoose from "mongoose"
import { nanoid } from "nanoid"
import { GameInterface } from "Lib/game"

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
  created: {
    type: Date,
    default: () => new Date(),
  },
  state: {
    board: {
      type: [String],
      enum: ["x", "o", ""],
    },
  },
})

export default (mongoose.models.Game as mongoose.Model<GameInterface>) ||
  mongoose.model<GameInterface>("Game", GameSchema)
