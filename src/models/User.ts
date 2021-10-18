import mongoose from "mongoose"
import mongooseFuzzySearching, {
  MongooseFuzzyModel,
} from "mongoose-fuzzy-searching"

// funny name for this one :)
export interface UserInterface {
  _id: string
  username: string
  discordId: string
  refreshToken: string
  games: string[]
  pendingInvites: string[]
}

const UserSchema = new mongoose.Schema<
  UserInterface,
  mongoose.Model<UserInterface>,
  UserInterface
>(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
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
  },
  { _id: false }
)

// allow fuzzy searching for usernames
UserSchema.plugin(mongooseFuzzySearching, { fields: ["username"] })

export default (mongoose.models
  .User as mongoose.Model<UserInterface> as MongooseFuzzyModel<UserInterface>) ||
  (mongoose.model<UserInterface>(
    "User",
    UserSchema
  ) as MongooseFuzzyModel<UserInterface>)
