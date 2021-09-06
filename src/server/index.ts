import { createServer } from "http"
import { parse } from "url"
import next from "next"
import mongoose from "mongoose"
import { config } from "dotenv"

config()

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

if (!process.env.MONGODB_URI) throw new Error(".env is missing a MongoDB URI.")
mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection

db.on("error", console.error)
db.once("open", () => {
  console.log("Database connected!")

  app.prepare().then(() => {
    createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    })
      .listen(process.env.PORT)
      .on("error", err => {
        throw err
      })
      .on("listening", () => {
        console.log(`> Ready on port ${process.env.PORT}`)
      })
  })
})
