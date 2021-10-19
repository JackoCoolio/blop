export interface VerifiedEnv extends NodeJS.ProcessEnv {
  MONGODB_URI: string
  REDIRECT_URI: string
  DISCORD_AUTH_URL: string
  DISCORD_CLIENT_ID: string
  DISCORD_CLIENT_SECRET: string
  SESSION_EXPIRE_TIME: string
  PORT: string
}

/**
 * Determines whether or not a given NodeJS.ProcessEnv contains certain guaranteed values that are present in VerifiedEnv.
 *
 * @param env the NodeJS.ProcessEnv to verify
 * @returns true if env is a VerifiedEnv
 */
export function isVerifiedEnv(env: NodeJS.ProcessEnv): env is VerifiedEnv {
  return (
    !!env.MONGODB_URI &&
    !!env.REDIRECT_URI &&
    !!env.DISCORD_AUTH_URL &&
    !!env.DISCORD_CLIENT_ID &&
    !!env.DISCORD_CLIENT_SECRET &&
    !!env.SESSION_EXPIRE_TIME &&
    !!env.PORT
  )
}
