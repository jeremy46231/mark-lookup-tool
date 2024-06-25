import { Temporal } from 'temporal-polyfill'
import { parseTime } from './helpers'

type SearchResult = {
  id: string
  name: string
  school: string
  city: string
  state: string
  service: string
}

export abstract class Service {
  abstract search(query: string): Promise<SearchResult[]>

  abstract findAthlete(query: string): Promise<ServiceAthlete>
}

export abstract class ServiceAthlete {
  abstract service: string
  loaded = false
  times: ServiceTime[] = []

 constructor(public id: string) {}

 async load() {}

  abstract get firstName(): string | null
  abstract get lastName(): string | null
  abstract get gender(): string | null

  abstract get urls(): string[]
  abstract get pfpUrl(): string | null

  get fullName() {
    return [this.firstName, this.lastName].filter((s) => s).join(' ') || null
  }
}

export abstract class ServiceTime {
  abstract service: string
  loaded = false

  async load() {}

  abstract get timeString(): string | null
  abstract get id(): string | null
  abstract get meet(): string | null
  abstract get date(): Temporal.PlainDate | null
  abstract get event(): string | null
  abstract get meters(): number | null

  get timeSeconds() {
    if (!this.timeString) return null
    return parseTime(this.timeString)
  }
}
