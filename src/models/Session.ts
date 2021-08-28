import mongoose from "mongoose"
import { nanoid } from "nanoid"

export interface SessionInterface {
  _id: string
  userId: string
}

const SessionSchema = new mongoose.Schema<
  SessionInterface,
  mongoose.Model<SessionInterface>,
  SessionInterface
>({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  userId: {
    type: String,
    required: true,
  },
})

export default (mongoose.models.Session as mongoose.Model<SessionInterface>) ||
  mongoose.model<SessionInterface>("Session", SessionSchema)
