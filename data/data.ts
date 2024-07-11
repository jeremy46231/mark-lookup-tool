import teamsJson from '@/data/teams.json'
import athletesJson from '@/data/athletes.json'

type teamsJson = [
  string,
  {
    name: string
    players: string[]
  }
][]
type athletesJson = [
  string,
  {
    name: string
    ids: [service: string, id: string][]
  }
][]

export const teams = new Map(teamsJson as teamsJson)
export const athletes = new Map(athletesJson as athletesJson)
