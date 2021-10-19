import mongoose from "mongoose"

// the interface for FriendSchema
export interface FriendInterface {
  // the _id of the user
  id: string
  // when this friend's request was accepted
  since: Date
}

// the schema that describes a friend relation
const FriendSchema = new mongoose.Schema<
  FriendInterface,
  mongoose.Model<FriendInterface>,
  FriendInterface
>(
  {
    id: {
      type: String,
    },
    since: Date,
  },
  { _id: false }
)

// the interface for FriendsListSchema
export interface FriendsListInterface {
  // the user's _id
  _id: string
  // the user's confirmed friends
  friends: FriendInterface[]
  // the user's received friend requests
  receivedRequests: string[]
  // the user's sent friend requests
  sentRequests: string[]
}

// the schema that describes a user's friends list
const FriendsListSchema = new mongoose.Schema<
  FriendsListInterface,
  mongoose.Model<FriendsListInterface>,
  FriendsListInterface
>(
  {
    _id: {
      type: String,
    },
    friends: {
      type: [FriendSchema],
      default: [],
    },
    receivedRequests: {
      type: [String],
      default: [],
    },
    sentRequests: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
)

export default (mongoose.models
  .FriendsList as mongoose.Model<FriendsListInterface>) ||
  mongoose.model<FriendsListInterface>("FriendsList", FriendsListSchema)
