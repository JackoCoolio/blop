export interface GameMetadata {
  _id: string
  type: string
  players: string[]
  turn: number
  myTurn: boolean
  created: Date
}

export interface BaseGameInterface extends GameMetadata {
  state: any
}
