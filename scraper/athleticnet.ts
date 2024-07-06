import { Temporal } from 'temporal-polyfill'
import { Matcher, evaluateMatchers, formatMeters } from './helpers'
import { Service, ServiceAthlete, ServiceTime } from './service'
import {
  AthleticNetAPISearch,
  AthleticNetAPITFAthlete,
  AthleticNetAPIXCAthlete,
} from './apiTypes'

export class AthleticNet extends Service {
  readonly service = 'Athletic.net' as const

  async _search(query: string) {
    const response = await fetch(
      `https://www.athletic.net/api/v1/AutoComplete/search?q=${encodeURIComponent(
        query
      )}`
    )
    const json = (await response.json()) as AthleticNetAPISearch
    return json.response.docs.filter((result) => result.type === 'Athlete')
  }
  async search(query: string) {
    const subtextRegex = /^(.+) \((.+)\)\|\|(.+), ([A-Z]+)/
    const rawResults = await this._search(query)
    return rawResults.map((result) => {
      const [_match, school, _schoolType, city, state] =
        result.subtext.match(subtextRegex) || []
      return {
        id: result.id_db,
        name: result.textsuggest,
        school,
        city,
        state,
        service: 'Athletic.net',
      }
    })
  }
  async findAthlete(query: string) {
    const searchResults = await this.search(query)
    const topResult = searchResults[0]
    const athlete = new AthleticNetAthlete(topResult.id)
    await athlete.load()
    return athlete
  }
  async getAthlete(id: string) {
    const athlete = new AthleticNetAthlete(id)
    await athlete.load()
    return athlete
  }
}

export class AthleticNetAthlete extends ServiceAthlete {
  readonly service = 'Athletic.net' as const

  _info: AthleticNetAPIXCAthlete['athlete'] | null = null
  _xcMeets: AthleticNetAPIXCAthlete['meets'] | null = null
  _xcEvents: AthleticNetAPIXCAthlete['distancesXC'] | null = null
  _xcTimes: AthleticNetAPIXCAthlete['resultsXC'] | null = null
  _tfMeets: AthleticNetAPITFAthlete['meets'] | null = null
  _tfEvents: AthleticNetAPITFAthlete['eventsTF'] | null = null
  _tfTimes: AthleticNetAPITFAthlete['resultsTF'] | null = null

  async load() {
    if (this.loaded) {
      console.warn('Already loaded Athletic.net athlete', this.id)
      return
    }
    const xcResponse = await fetch(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=xc&level=`
    )
    const xcJson = (await xcResponse.json()) as AthleticNetAPIXCAthlete
    this._info = xcJson.athlete
    this._xcMeets = xcJson.meets!
    this._xcEvents = xcJson.distancesXC!
    this._xcTimes = xcJson.resultsXC!

    const tfResponse = await fetch(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=tf&level=`
    )
    const tfJson = (await tfResponse.json()) as AthleticNetAPITFAthlete
    this._tfMeets = tfJson.meets!
    this._tfEvents = tfJson.eventsTF!
    this._tfTimes = tfJson.resultsTF!

    this.times = [
      ...this._xcTimes.map(
        (data) =>
          new AthleticNetTime(data, 'xc', this._xcMeets!, this._xcEvents!)
      ),
      ...this._tfTimes.map(
        (data) =>
          new AthleticNetTime(data, 'tf', this._tfMeets!, this._tfEvents!)
      ),
    ]

    await Promise.all(this.times.map((time) => time.load()))

    this.loaded = true
  }

  get firstName() {
    return this._info?.FirstName || null
  }
  get lastName() {
    return this._info?.LastName || null
  }
  get gender() {
    return this._info?.Gender || null
  }

  get urls() {
    return [
      `https://www.athletic.net/athlete/${this.id}/cross-country`,
      `https://www.athletic.net/athlete/${this.id}/track-and-field`,
    ]
  }
  get pfpUrl() {
    return this._info?.PhotoUrl || null
  }
}

const athleticNetPrettyMatchers: Matcher<string>[] = [
  [/^(\d+) Meter(?:s| Dash| Fly)$/i, (s) => formatMeters(s)],
  [/^(\d+(?:\.\d+)?) Miles?$/i, (s) => `${s} mile`],
  [/^(\d+x\d+)(?:Throwers)? Relay$/i, (s) => `${formatMeters(s)} relay`],

  [/^(\d+)m Hurdles$/i, (s) => `${formatMeters(s)} hurdles`],
  [/^(\d+)y Hurdles$/i, (s) => `${s} yard hurdles`],

  [/^(\d+(?:\.\d+))k Steeplechase$/i, (s) => `${s} kilometer steeple chase`],
  [/^(\d+) Mile Steeplechase$/i, (s) => `${s} mile steeple chase`],
  [/^(\d+(?:,000)?)m Racewalk$/i, (s) => `${formatMeters(s)} race walk`],
  [/^(\d+) Mile Racewalk$/i, (s) => `${s} mile race walk`],
  ['Mile Racewalk', '1 mile race walk'],
  ['1-Hour Racewalk', '1 hour race walk'],

  [
    /^(\d+x\d+(?:\.\d+)?) Shuttle (?:Hurdles|Relay)$/i,
    (s) => `${formatMeters(s)} shuttle hurdles`,
  ],
  [
    /^(\d+x\d+(?:\.\d+)?) Yard Shuttle (?:Hurdles|Relay)$/i,
    (s) => `${s} yard shuttle hurdles`,
  ],
  [/^(\d+x\d+) Yard Relay$/i, (s) => `${s} yard relay`],
  [/^(\d+)xMile Relay$/i, (s) => `${s}x1 mile relay`],
  [/^[SDM]MR (\d+)m$/i, (s) => `${formatMeters(s)} medley relay`],
  [/^[SDM]MR (\d+)y$/i, (s) => `${s} yard medley relay`],
  [/^[SDM]MR (\d+(?:\.\d+)?) Mile$/i, (s) => `${s} mile medley relay`],
]
const athleticNetMetersMatchers: Matcher<number>[] = [
  [
    /^(\d+(?:,000)?)(?: Meter(?:s| Dash| Fly)|m (?:Hurdles|Racewalk))$/i,
    (s) => parseInt(s ?? 'NaN'),
  ],
  [
    /^(\d+(?:\.\d+)?) Mile(?:|s| Steeplechase| Racewalk)$/i,
    (s) => parseFloat(s ?? 'NaN') * 1609.344,
  ],
  [/^(\d+(?:\.\d+))k Steeplechase$/i, (s) => parseFloat(s ?? 'NaN') * 1000],
]

export class AthleticNetTime extends ServiceTime {
  readonly service = 'Athletic.net' as const

  _data:
    | AthleticNetAPITFAthlete['resultsTF'][0]
    | AthleticNetAPIXCAthlete['resultsXC'][0]
  _type: 'tf' | 'xc'
  _meets: AthleticNetAPITFAthlete['meets']
  _events:
    | AthleticNetAPITFAthlete['eventsTF']
    | AthleticNetAPIXCAthlete['distancesXC']

  constructor(
    data:
      | AthleticNetAPITFAthlete['resultsTF'][0]
      | AthleticNetAPIXCAthlete['resultsXC'][0],
    type: 'tf' | 'xc',
    meets: AthleticNetAPITFAthlete['meets'],
    events:
      | AthleticNetAPITFAthlete['eventsTF']
      | AthleticNetAPIXCAthlete['distancesXC']
  ) {
    super()
    this._data = data
    this._type = type
    this._meets = meets
    this._events = events

    this.loaded = true
  }

  get timeString() {
    return this._data.Result.replace(/a$/, '')
      .replace(/(?<=:\d\d)$/, '.00')
      .replace(/(?<=:\d\d.\d)$/, '0')
  }

  get id() {
    return String(this._data.IDResult)
  }
  get meet() {
    return this._meets[this._data.MeetID].MeetName
  }
  get date() {
    return Temporal.PlainDate.from(this._meets[this._data.MeetID].EndDate)
  }

  get _eventCode() {
    const eventIdentifier =
      'EventID' in this._data ? this._data.EventID : this._data.Distance
    const eventData = this._events.find((event) =>
      'IDEvent' in event ? event.IDEvent : event.Meters === eventIdentifier
    )
    if (!eventData) return null
    const eventCode =
      'Event' in eventData
        ? eventData.Event.toLowerCase().trim()
        : `${eventData.Distance} ${eventData.Units.toLowerCase()}`
    return eventCode
  }
  get event() {
    if (!this._eventCode) return null
    return evaluateMatchers(
      this._eventCode,
      athleticNetPrettyMatchers,
      this._eventCode.toLowerCase()
    )
  }
  get meters() {
    if (!this._eventCode) return null
    return evaluateMatchers(this._eventCode, athleticNetMetersMatchers, null)
  }
}
