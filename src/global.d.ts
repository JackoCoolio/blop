interface MongooseState {
  conn: typeof import("mongoose") | null
  promise: Promise<typeof import("mongoose")> | null
}

declare module NodeJS {
  interface Global {
    mongoose: MongooseState
  }
}

declare var mongoose: MongooseState
