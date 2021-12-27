export type Winners = number[]

export interface GameMetadata {
  _id: string
  type: string
  players: string[]
  turn: number
  myTurn: boolean
  created: Date
  winners: Winners
}

export interface BaseGameInterface extends GameMetadata {
  state: any
}

export function isUsersTurn(userId: string, game: GameMetadata): boolean {
  return game.players[game.turn % game.players.length] === userId
}
