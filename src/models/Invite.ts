import mongoose from "mongoose"
import { nanoid } from "nanoid"

export interface InviteInterface {
  _id: string
  inviter: string
  invitee: string
  gameId: string
  created: Date
}

const InviteSchema = new mongoose.Schema<
  InviteInterface,
  mongoose.Model<InviteInterface>,
  InviteInterface
>({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  inviter: {
    type: String,
    required: true,
  },
  invitee: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: () => new Date(),
  },
})

export default (mongoose.models.Invite as mongoose.Model<InviteInterface>) ||
  mongoose.model<InviteInterface>("Invite", InviteSchema)
