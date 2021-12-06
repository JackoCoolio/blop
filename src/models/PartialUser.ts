import mongoose from "mongoose"
import { nanoid } from "nanoid"

export interface PartialUserInterface {
  _id: string
  discordId: string
  accessToken: string
  refreshToken: string
}

const PartialUserSchema = new mongoose.Schema<
  PartialUserInterface,
  mongoose.Model<PartialUserInterface>,
  PartialUserInterface
>({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  discordId: {
    type: String,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
})

export default (mongoose.models
  .PartialUser as mongoose.Model<PartialUserInterface>) ||
  mongoose.model<PartialUserInterface>("PartialUser", PartialUserSchema)
