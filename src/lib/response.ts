import { NextApiResponse } from "next"

export function isErrorResponse(body: any): body is ErrorResponse {
  return !!body.error
}

export function isSuccessfulResponse<ApiResponseType>(
  res: PrivateApiResponse<ApiResponseType>
): res is SuccessfulPrivateApiResponse<ApiResponseType> {
  return !isErrorResponse(res.body)
}

export function isFailedResponse(res: any): res is FailedPrivateApiResponse {
  return !!res.body.error
}

export async function respond(
  res: NextApiResponse,
  response: PrivateApiResponse<unknown>
) {
  res.status(response.statusCode).json(response.body)
}
