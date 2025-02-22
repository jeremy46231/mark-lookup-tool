import { Temporal } from 'temporal-polyfill'
import { parseTime } from './helpers'

export type searchResult = {
  id: string
  name: string
  school: string
  city: string
  state: string
  url: string
  service: string
}

export abstract class Service {
  abstract service: string

  abstract search(query: string): Promise<searchResult[]>
  abstract findAthlete(query: string): Promise<ServiceAthlete>
  abstract getAthlete(id: string): Promise<ServiceAthlete>
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
