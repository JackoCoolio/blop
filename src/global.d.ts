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
