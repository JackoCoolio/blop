import mongoose from "mongoose"
import { nanoid } from "nanoid"

// funny name for this one :)
export interface UserInterface {
  _id: string
  newUser: boolean
  discordId: string
  refreshToken: string
  games: string[]
  pendingInvites: string[]
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
  newUser: {
    type: Boolean,
    default: true,
  },
  discordId: {
    type: String,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  games: {
    type: [String],
    default: [],
  },
  pendingInvites: {
    type: [String],
    default: [],
  },
})

export default (mongoose.models.User as mongoose.Model<UserInterface>) ||
  mongoose.model<UserInterface>("User", UserSchema)
