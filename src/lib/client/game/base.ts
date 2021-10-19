export interface BaseGameInterface {
  _id: string
  type: string
  players: string[]
  turn: number
  created: Date
}
