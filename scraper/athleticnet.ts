import { Temporal } from 'temporal-polyfill'
import { Matcher, evaluateMatchers, parseTime, type TODO } from './helpers'
import { Service, ServiceAthlete, ServiceTime } from './service'

export class AthleticNet extends Service {
  async _search(query: string) {
    const response = await fetch(
      `https://www.athletic.net/api/v1/AutoComplete/search?q=${encodeURIComponent(
        query
      )}`
    )
    const json = await response.json()
    return json.response.docs.filter(
      (result) => result.type === 'Athlete'
    ) as TODO[]
  }
  async search(query: string) {
    const subtextRegex = /^(.+) \((.+)\)\|\|(.+), ([A-Z]+)/
    const rawResults = await this._search(query)
    return rawResults.map((result) => {
      const [match, school, schoolType, city, state] =
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
    athlete.load()
    return athlete
  }
}

export class AthleticNetAthlete extends ServiceAthlete {
  service = 'Athletic.net'

  _info: TODO
  _xcMeets: TODO
  _xcEvents: TODO
  _xcTimes: TODO
  _tfMeets: TODO
  _tfEvents: TODO
  _tfTimes: TODO

  async load() {
    const xcResponse = await fetch(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=xc&level=`
    )
    const xcJson = await xcResponse.json()
    this._info = xcJson.athlete
    this._xcMeets = xcJson.meets
    this._xcEvents = xcJson.distancesXC
    this._xcTimes = xcJson.resultsXC

    const tfResponse = await fetch(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=tf&level=`
    )
    const tfJson = await tfResponse.json()
    this._tfMeets = tfJson.meets
    this._tfEvents = tfJson.eventsTF
    this._tfTimes = tfJson.resultsTF

    this.times = [
      ...this._xcTimes.map(
        (data) => new AthleticNetTime(data, 'xc', this._xcMeets, this._xcEvents)
      ),
      ...this._tfTimes.map(
        (data) => new AthleticNetTime(data, 'tf', this._tfMeets, this._tfEvents)
      ),
    ]

    this.loaded = true
  }

  get firstName() {
    return this._info.firstName || null
  }
  get lastName() {
    return this._info.lastName || null
  }
  get gender() {
    return this._info.gender || null
  }

  get urls() {
    return [
      `https://www.athletic.net/athlete/${this.id}/cross-country`,
      `https://www.athletic.net/athlete/${this.id}/track-and-field`,
    ]
  }
  get pfpUrl() {
    return this._info.profilePhotoUrl || null
  }
}

const athleticNetPrettyMatchers: Matcher<string>[] = [
  [/^(\d+) Meter(?:s| Dash| Fly)$/i, (s) => `${s} meter`],
  [/^(\d+(?:\.\d+)?) Miles?$/i, (s) => `${s} mile`],
  [/^(\d+x\d+)(?:Throwers)? Relay$/i, (s) => `${s} meter relay`],

  [/^(\d+)m Hurdles$/i, (s) => `${s} meter hurdles`],
  [/^(\d+)y Hurdles$/i, (s) => `${s} yard hurdles`],

  [/^(\d+(?:\.\d+))k Steeplechase$/i, (s) => `${s} kilometer steeple chase`],
  [/^(\d+) Mile Steeplechase$/i, (s) => `${s} mile steeple chase`],
  [/^(\d+(?:,000)?)m Racewalk$/i, (s) => `${s} meter race walk`],
  [/^(\d+) Mile Racewalk$/i, (s) => `${s} mile race walk`],
  ['Mile Racewalk', '1 mile race walk'],
  ['1-Hour Racewalk', '1 hour race walk'],

  [
    /^(\d+x\d+(?:\.\d+)?) Shuttle (?:Hurdles|Relay)$/i,
    (s) => `${s} meter shuttle hurdles`,
  ],
  [
    /^(\d+x\d+(?:\.\d+)?) Yard Shuttle (?:Hurdles|Relay)$/i,
    (s) => `${s} yard shuttle hurdles`,
  ],
  [/^(\d+x\d+) Yard Relay$/i, (s) => `${s} yard relay`],
  [/^(\d+)xMile Relay$/i, (s) => `${s}x1 mile relay`],
  [/^[SDM]MR (\d+)m$/i, (s) => `${s} meter medley relay`],
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
  service = 'Athletic.net'

  _data: TODO
  _type: TODO
  _meets: TODO
  _events: TODO

  constructor(data: TODO, type: TODO, meets: TODO, events: TODO) {
    super()
    this._data = data
    this._type = type
    this._meets = meets
    this._events = events

    this.loaded = true
  }
  async load() {}

  get timeString() {
    return this._data.Result.replace(/a$/, '')
      .replace(/(?<=:\d\d)$/, '.00')
      .replace(/(?<=:\d\d.\d)$/, '0')
  }

  get id() {
    return this._data.IDResult
  }
  get meet() {
    return this._meets[this._data.MeetID].MeetName
  }
  get date() {
    return Temporal.PlainDate.from(this._meets[this._data.MeetID].EndDate)
  }

  get _eventCode() {
    const eventIdentifier =
      this._data[this._type === 'tf' ? 'EventID' : 'Distance']
    const eventData = this._events.find(
      (event) =>
        event[this._type === 'tf' ? 'IDEvent' : 'Meters'] === eventIdentifier
    )
    const eventCode =
      this._type === 'tf'
        ? eventData.Event.toLowerCase().trim()
        : `${eventData.Distance} ${eventData.Units.toLowerCase()}`
    return eventCode
  }
  get event() {
    return evaluateMatchers(
      this._eventCode,
      athleticNetPrettyMatchers,
      this._eventCode.toLowerCase() as string
    )
  }
  get meters() {
    return evaluateMatchers(this._eventCode, athleticNetMetersMatchers, null)
  }
}
