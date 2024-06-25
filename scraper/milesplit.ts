import { Temporal } from 'temporal-polyfill'
import { Matcher, evaluateMatchers, parseTime, type TODO } from './helpers'

export class MileSplit {
  constructor() {
    throw new Error('The MileSplit class should not be constructed')
  }

  static async _search(query: string) {
    const response = await fetch(
      `https://www.milesplit.com/api/v1/athletes/search?q=${encodeURIComponent(
        query
      )}`
    )
    const json = await response.json()
    return json.data as TODO[]
  }
  static async search(query: string) {
    const rawResults = await MileSplit._search(query)
    return rawResults.map((result) => ({
      id: result.id,
      name: [result.firstName, result.lastName].filter((s) => s).join(' '),
      school: result.schoolName,
      city: result.city,
      state: result.state,
      service: 'MileSplit',
    }))
  }
  static async findAthlete(query: string) {
    const searchResults = await MileSplit.search(query)
    const topResult = searchResults[0]
    const athlete = new MileSplitAthlete(topResult.id)
    athlete.load()
    return athlete
  }
}

export class MileSplitAthlete {
  service = 'MileSplit'
  loaded = false
  times: MileSplitTime[] = []

  _info: TODO
  _times: TODO[] = []

  constructor(public id: string) {}

  async load() {
    const statsResponse = await fetch(
      `https://www.milesplit.com/api/v1/athletes/${this.id}/stats`
    )
    const statsJson = (await statsResponse.json()) as TODO
    this._info = statsJson._embedded.athlete
    this._times = statsJson.data

    // const teamId = statsJson._embedded.athlete.teamId
    // const teamResponse = UrlFetchApp.fetch(`https://www.milesplit.com/api/v1/teams/${teamId}`)
    // const teamJson = JSON.parse(teamResponse.getContentText())
    // this._team = teamJson.data

    this.times = this._times.map((data) => new MileSplitTime(data))

    this.loaded = true
  }

  get firstName() {
    return this._info.firstName || null
  }
  get lastName() {
    return this._info.lastName || null
  }
  get fullName() {
    return [this.firstName, this.lastName].filter((s) => s).join(' ') || null
  }
  get gender() {
    return this._info.gender || null
  }

  get urls() {
    return [`https://milesplit.com/athletes/${this.id}`]
  }
  get pfpUrl() {
    return this._info.profilePhotoUrl || null
  }
}

const mileSplitPrettyMatchers: Matcher<string>[] = [
  [/^(\d+)m$/i, (s) => `${s} meter`],
  [/^(\d+(?:\.\d+)?)mile$/i, (s) => `${s} mile`],
  ['Mile', '1 mile'],
  [/^(\d+)H$/i, (s) => `${s} meter hurdles`],
  ['D', 'discus'],
  ['HJ', 'high jump'],
  ['HT', 'hammer throw'],
  ['D', 'javelin'],
  ['LJ', 'long jump'],
  ['PV', 'pole vault'],
  ['S', 'shot put'],
  ['TJ', 'triple jump'],
  [/^(\d+)mSC$/i, (s) => `${s} meter steeple chase`],
  [/^(\d+)RW$/i, (s) => `${s} meter race walk`],
]
const mileSplitMetersMatchers: Matcher<number>[] = [
  [/^(\d+)(?:m(?:SC)?|h|rw)$/i, (s) => parseInt(s ?? 'NaN')],
  [/(\d+(?:\.\d+)?)mile/i, (s) => parseFloat(s ?? 'NaN') * 1609.344],
]

export class MileSplitTime {
  service = 'MileSplit'
  loaded = false

  _data: TODO
  _meet: TODO = undefined
  date: TODO

  constructor(data: TODO) {
    this._data = data
  }
  async load() {
    const response = await fetch(
      `https://www.milesplit.com/api/v1/meets/${this._data.meetId}`
    )
    const meetJson = await response.json()
    this._meet = meetJson.data
    this.date = Temporal.PlainDate.from(this._meet.dateEnd)
    this.loaded = true
  }

  get timeString() {
    return this._data.mark
  }
  get timeSeconds() {
    return parseTime(this.timeString)
  }

  get id() {
    return this._data.id
  }
  get meet() {
    return this._data.meetName.trim()
  }

  get event() {
    const eventCode = this._data.eventCode.trim()
    return evaluateMatchers(eventCode, mileSplitPrettyMatchers, eventCode)
  }
  get meters() {
    const eventCode = this._data.eventCode.trim()
    return evaluateMatchers(eventCode, mileSplitMetersMatchers, null)
  }
}
