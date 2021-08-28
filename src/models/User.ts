import mongoose from "mongoose"
import { nanoid } from "nanoid"

// funny name for this one :)
export interface UserInterface {
  _id: string
  discordId: string
  refreshToken: string
  games: string[]
}

const UserSchema = new mongoose.Schema<
  UserInterface,
  mongoose.Model<UserInterface>,
  UserInterface
>({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  discordId: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  games: {
    type: [String],
    default: [],
  },
})

export default (mongoose.models.User as mongoose.Model<UserInterface>) ||
  mongoose.model<UserInterface>("User", UserSchema)
