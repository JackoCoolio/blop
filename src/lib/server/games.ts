import { GameMetadata } from "Lib/client/game/base"
import Game from "Models/Game"
import User from "Models/User"
import { err, ok, Result } from "neverthrow"
import { getPendingInvites } from "./invite"
import { ResponseCode } from "./util"

export async function getCurrentGames(
  userId: string
): Promise<Result<GameMetadata[], ApiError>> {
  const userDoc = await User.findById(userId)

  if (!userDoc) {
    return err({
      statusCode: ResponseCode.BAD_REQUEST,
      message: "Invalid userId!",
    })
  }

  const gameIds = userDoc.games

  const games: GameMetadata[] = []

  const invalidGameIds: string[] = []
  for (let i = 0; i < gameIds.length; i++) {
    const gameDoc = await Game.findById(gameIds[i])

    if (!gameDoc) {
      invalidGameIds.push(gameIds[i])
      continue
    }

    games.push({
      _id: gameDoc._id,
      created: gameDoc.created,
      players: gameDoc.players,
      turn: gameDoc.turn,
      type: gameDoc.type,
    })
  }

  // prune invalid game IDs
  if (invalidGameIds.length > 0) {
    userDoc.games.filter(id => !invalidGameIds.includes(id))
  }

  return ok(games)
}

export async function getGameMetadata(
  gameId: string,
  userId: string
): Promise<Result<GameMetadata, ApiError>> {
  const gameDoc = await Game.findById(gameId)

  if (!gameDoc) {
    return err({
      statusCode: ResponseCode.BAD_REQUEST,
      message: "Invalid gameId!",
    })
  }

  const players = gameDoc.players

  // get user's pending invites
  const invitesResult = await getPendingInvites(userId)
  if (invitesResult.isErr()) {
    return err(invitesResult.error)
  }

  const invites = invitesResult.value

  if (
    !players.includes(userId) &&
    !invites.map(x => x.gameId).includes(gameId)
  ) {
    return err({
      statusCode: ResponseCode.UNAUTHORIZED,
      message: "You are not a player in this game!",
    })
  }

  // return game metadata
  return ok({
    _id: gameDoc._id,
    players: gameDoc.players,
    turn: gameDoc.turn,
    type: gameDoc.type,
    created: gameDoc.created,
  })
}
