import { Temporal } from 'temporal-polyfill'
import { AthleticNet, AthleticNetAthlete } from './athleticnet'
import { MileSplit, MileSplitAthlete } from './milesplit'
import { pickVersion } from './helpers'

export class Scraper {
  constructor() {
    throw new Error('The Scraper class should not be constructed')
  }

  static async search(query: string) {
    return {
      mileSplit: await MileSplit.search(query),
      athleticNet: await AthleticNet.search(query),
    }
  }
  static async findAthlete(query: string) {
    const results = await Scraper.search(query)
    const topIds = {
      mileSplit: results.mileSplit[0]?.id,
      athleticNet: results.athleticNet[0]?.id,
    }
    const athlete = new Athlete(topIds)
    athlete.load()
    return athlete
  }
}

export class Athlete {
  mileSplit: MileSplitAthlete
  atheticNet: AthleticNetAthlete
  loaded = false
  times: Time[] = []

  constructor(ids: { mileSplit: string; athleticNet: string }) {
    this.mileSplit = new MileSplitAthlete(ids.mileSplit)
    this.atheticNet = new AthleticNetAthlete(ids.athleticNet)
  }

  async load() {
    await Promise.all([this.mileSplit.load(), this.atheticNet.load()])

    const timeSources = [...this.mileSplit.times, ...this.atheticNet.times]
    await Promise.all(timeSources.map((source) => source.load()))

    const matchingSources = new Map()

    for (const source of timeSources) {
      const key = `${source.date.toString()}|${source.event}|${
        source.timeSeconds
      }`
      if (matchingSources.has(key)) {
        matchingSources.get(key).push(source)
      } else {
        matchingSources.set(key, [source])
      }
    }

    this.times = [...matchingSources.values()].map(
      (sources) => new Time(sources)
    )

    this.times.sort(
      (a, b) =>
        Temporal.PlainDate.compare(a.date, b.date) ||
        a.meters - b.meters ||
        a.event.localeCompare(b.event, 'en-US-u-kn')
    )

    this.loaded = true
  }

  get firstName() {
    return pickVersion([this.mileSplit.firstName, this.atheticNet.firstName], {
      filter: 'string',
    })
  }
  get lastName() {
    return pickVersion([this.mileSplit.lastName, this.atheticNet.lastName], {
      filter: 'string',
    })
  }
  get fullName() {
    return [this.firstName, this.lastName].filter((s) => s).join(' ') || null
  }
  get gender() {
    return pickVersion([this.mileSplit.gender, this.atheticNet.gender], {
      filter: /M|F/,
    })
  }

  get urls() {
    return [...this.atheticNet.urls, ...this.mileSplit.urls]
  }
  get pfpUrl() {
    return pickVersion([this.mileSplit.pfpUrl, this.atheticNet.pfpUrl], {
      filter: 'string',
    })
  }
}

export class Time {
  constructor(sources) {
    this.sources = sources
    this.loaded = true
  }
  load() {}

  get timeString() {
    return pickVersion(
      this.sources.map((source) => source.timeString),
      { filter: /^(\d+:)?\d+\.\d\d$/ }
    )
  }
  get timeSeconds() {
    return parseTime(this.timeString)
  }

  get meet() {
    return pickVersion(this.sources.map((source) => source.meet))
  }
  get date() {
    return pickVersion(
      this.sources.map((source) => source.date, {
        comparison: (a, b) => a.equals(b),
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
