import { Temporal } from 'temporal-polyfill'
import { parseTime, pickVersion } from './helpers'
import { AthleticNet } from './athleticnet'
import { MileSplit } from './milesplit'
import { Service, ServiceAthlete, ServiceTime } from './service'

const services: (new () => Service)[] = [MileSplit, AthleticNet]

export class Scraper {
  constructor(
    public sources: Service[] = services.map((Service) => new Service())
  ) {}

  // async search(query: string) {
  //   return await Promise.all(this.sources.map((source) => source.search(query)))
  // }
  async findAthlete(query: string) {
    const results = await Promise.all(
      this.sources.map((source) => source.findAthlete(query))
    )
    const athlete = new Athlete(results)
    await athlete.load()
    return athlete
  }
}

export class Athlete {
  loaded = false
  times: Time[] = []

  /**
   * @param sources - The sources to pull data from, must be already loaded
   */
  constructor(public sources: ServiceAthlete[]) {}

  async load() {
    if (this.loaded) {
      console.warn('Already loaded Athlete', this.fullName)
      return
    }

    const timeSources = this.sources.flatMap((source) => source.times)

    const matchingTimeSources = new Map<string, ServiceTime[]>()

    for (const source of timeSources) {
      const key = JSON.stringify({
        date: source.date?.toString(),
        event: source.event,
        meters: source.meters,
      })
      const existingSources = matchingTimeSources.get(key)
      if (existingSources) {
        existingSources.push(source)
      } else {
        matchingTimeSources.set(key, [source])
      }
    }

    this.times = [...matchingTimeSources.values()].map(
      (sources) => new Time(sources)
    )

    this.times.sort(
      (a, b) =>
        // Sort by date, earliest first
        (a.date instanceof Temporal.PlainDate &&
        b.date instanceof Temporal.PlainDate
          ? Temporal.PlainDate.compare(a.date, b.date)
          : 0) ||
        // If the dates are the same, sort by meters, shortest first
        (typeof a.meters === 'number' && typeof b.meters === 'number'
          ? a.meters - b.meters
          : 0) ||
        // If the meters are the same, sort by event, alphabetically
        (typeof a.event === 'string' && typeof b.event === 'string'
          ? a.event.localeCompare(b.event, 'en-US-u-kn')
          : 0)
    )

    this.loaded = true
  }

  get firstName() {
    return pickVersion(
      this.sources.map((source) => source.firstName),
      {
        filter: 'string',
      }
    )
  }
  get lastName() {
    return pickVersion(
      this.sources.map((source) => source.lastName),
      {
        filter: 'string',
      }
    )
  }
  get fullName() {
    return [this.firstName, this.lastName].filter((s) => s).join(' ') || null
  }
  get gender() {
    return pickVersion(
      this.sources.map((source) => source),
      {
        filter: /M|F/,
      }
    )
  }

  get urls() {
    return this.sources.flatMap((source) => source.urls)
  }
  get pfpUrl() {
    return pickVersion(
      this.sources.map((source) => source.pfpUrl),
      {
        filter: 'string',
      }
    )
  }
}

export class Time {
  constructor(public sources: ServiceTime[]) {}

  get timeString() {
    return pickVersion(
      this.sources.map((source) => source.timeString),
      { filter: /^(\d+:)?\d+\.\d\d$/ }
    )
  }
  get timeSeconds() {
    if (!this.timeString) return null
    return parseTime(this.timeString)
  }

  get meet() {
    return pickVersion(this.sources.map((source) => source.meet))
  }
  get date() {
    return pickVersion(
      this.sources.map((source) => source.date, {
        comparison: (a: Temporal.PlainDate, b: Temporal.PlainDate) =>
          a.equals(b),
      })
    )
  }

  get event() {
    return pickVersion(
      this.sources.map((source) => source.event),
      { filter: 'string' }
    )
  }
  get meters() {
    return pickVersion(
      this.sources.map((source) => source.meters),
      { filter: 'number' }
    )
  }
}
