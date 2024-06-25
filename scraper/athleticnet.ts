class AthleticNet {
  constructor() {
    throw new Error('The AthleticNet class should not be constructed')
  }

  static _search(query) {
    const json = fetchJson(
      `https://www.athletic.net/api/v1/AutoComplete/search?q=${encodeURIComponent(
        query
      )}`
    )
    return json.response.docs.filter((result) => result.type === 'Athlete')
  }
  static search(query) {
    const subtextRegex = /^(.+) \((.+)\)\|\|(.+), ([A-Z]+)/
    return AthleticNet._search(query).map((result) => {
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
  static findAthlete(query) {
    const searchResults = AthleticNet.search(query)
    const topResult = searchResults[0]
    const athlete = new AthleticNetAthlete(topResult.id)
    athlete.load()
    return athlete
  }
}

class AthleticNetAthlete {
  constructor(id) {
    this.id = id
    this.service = 'Athletic.net'
    this.loaded = false

    this.times = []
  }

  load() {
    const xcJson = fetchJson(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=xc&level=`
    )
    this._info = xcJson.athlete
    this._xcMeets = xcJson.meets
    this._xcEvents = xcJson.distancesXC
    this._xcTimes = xcJson.resultsXC

    const tfJson = fetchJson(
      `https://www.athletic.net/api/v1/AthleteBio/GetAthleteBioData?athleteId=${this.id}&sport=tf&level=`
    )
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
  get fullName() {
    return [this.firstName, this.lastName].filter((s) => s).join(' ') || null
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

const athleticNetPrettyMatchers = [
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
const athleticNetMetersMatchers = [
  [
    /^(\d+(?:,000)?)(?: Meter(?:s| Dash| Fly)|m (?:Hurdles|Racewalk))$/i,
    (s) => parseInt(s),
  ],
  [
    /^(\d+(?:\.\d+)?) Mile(?:|s| Steeplechase| Racewalk)$/i,
    (s) => parseFloat(s) * 1609.344,
  ],
  [/^(\d+(?:\.\d+))k Steeplechase$/i, (s) => parseFloat(s) * 1000],
]

class AthleticNetTime {
  constructor(data, type, meets, events) {
    this._data = data
    this._type = type
    this._meets = meets
    this._events = events
    this.service = 'Athletic.net'
  }
  load() {}

  get timeString() {
    return this._data.Result.replace(/a$/, '')
      .replace(/(?<=:\d\d)$/, '.00')
      .replace(/(?<=:\d\d.\d)$/, '0')
  }
  get timeSeconds() {
    return parseTime(this.timeString)
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
      this._eventCode.toLowerCase()
    )
  }
  get meters() {
    return evaluateMatchers(this._eventCode, athleticNetMetersMatchers, null)
  }
}
