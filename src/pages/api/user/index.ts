import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import User from "Models/User"
import { ResponseCode } from "Lib/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"

const handler = nextConnect()

handler.use(authenticationMiddleware)

const allowedOptions = ["_id", "username"]
interface UserExistQueryOptions {
  _id?: string
  username?: string
}

interface Match {
  id: string
  username: string
}
interface UserExistsQueryResponseBody {
  matches: Match[]
}

export async function getMatchingUsers(
  options: UserExistQueryOptions
): Promise<
  PrivateApiResponse<
    UserExistsQueryResponseBody | ReturnType<typeof User.findOne>
  >
> {
  const keys = Object.keys(options)

  for (const key of keys) {
    if (!allowedOptions.includes(key)) {
      return {
        statusCode: ResponseCode.BAD_REQUEST,
        body: {
          error: "Invalid query parameters!",
        },
      }
    }
  }

  const info = await User.find({ ...options })

  // format output
  const output: Match[] = info.map(doc => {
    return {
      id: doc._id,
      username: doc.username,
    }
  })

  if (!info) {
    return {
      statusCode: ResponseCode.NOT_FOUND,
      body: {
        error: "User not found.",
      },
    }
  }

  return {
    statusCode: ResponseCode.OK,
    body: {
      matches: output,
    },
  }
}

handler.post(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    const response = await getMatchingUsers(JSON.parse(req.body))

    return res.status(response.statusCode).json(response.body)
  }
)

export default handler
