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

declare interface ErrorResponse {
  error: string
}

declare interface FailedPrivateApiResponse {
  statusCode: number
  body: ErrorResponse
}

declare interface SuccessfulPrivateApiResponse<ApiResponseType> {
  statusCode: number
  body: ApiResponseType
}

declare type PrivateApiResponse<ApiResponseType> =
  | SuccessfulPrivateApiResponse<ApiResponseType>
  | FailedPrivateApiResponse

declare interface ApiError {
  message: string
  statusCode: number
}

declare module "mongoose-fuzzy-searching" {
  import { Document, DocumentQuery, Model, Schema } from "mongoose"

  export interface MongooseFuzzyOptions<T> {
    fields: (T extends Object ? keyof T : string)[]
  }

  export interface MongooseFuzzyModel<T, QueryHelpers = {}>
    extends Model<T, QueryHelpers> {
    fuzzySearch(
      search: String,
      callBack?: (err: any, data: Model<T, QueryHelpers>[]) => void
    ): DocumentQuery<T[], T, QueryHelpers>
  }

  function fuzzyPlugin<T>(
    schema: Schema<T>,
    options: MongooseFuzzyOptions<T>
  ): void

  export default fuzzyPlugin
}
