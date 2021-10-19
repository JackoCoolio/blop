import nextConnect from "next-connect"
import { NextApiRequest, NextApiResponse } from "next"
import User from "Models/User"
import { ResponseCode } from "Lib/server/util"
import {
  AuthenticatedRequest,
  authenticationMiddleware,
} from "Middleware/loginChecker"
import { getUserInformation } from "Lib/server/user"

const handler = nextConnect()

handler.use(authenticationMiddleware)

handler.get(
  async (req: NextApiRequest & AuthenticatedRequest, res: NextApiResponse) => {
    // check if the id is valid
    if (!req.query.id || typeof req.query.id !== "string") {
      return res
        .status(ResponseCode.BAD_REQUEST)
        .json({ message: "id must be a string!" })
    }

    // get the user information
    const informationResult = await getUserInformation(req.query.id)

    if (informationResult.isOk()) {
      return res.status(ResponseCode.OK).json(informationResult.value)
    } else {
      return res
        .status(informationResult.error.statusCode)
        .json({ message: informationResult.error.message })
    }
  }
)

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
