import athletesJson from '@/data/athletes.json'

type athletesJson = [string, {
  name: string
  ids: [service: string, id: string][]
}][]

export const athletes = new Map(athletesJson as athletesJson)