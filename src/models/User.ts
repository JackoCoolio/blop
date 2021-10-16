import mongoose from "mongoose"
import { nanoid } from "nanoid"
import mongooseFuzzySearching, {
  MongooseFuzzyModel,
} from "mongoose-fuzzy-searching"

// funny name for this one :)
export interface UserInterface {
  _id: string
  username: string
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
  username: {
    type: String,
    unique: true,
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

// allow fuzzy searching for usernames
UserSchema.plugin(mongooseFuzzySearching, { fields: ["username"] })

export default (mongoose.models
  .User as mongoose.Model<UserInterface> as MongooseFuzzyModel<UserInterface>) ||
  (mongoose.model<UserInterface>(
    "User",
    UserSchema
  ) as MongooseFuzzyModel<UserInterface>)
