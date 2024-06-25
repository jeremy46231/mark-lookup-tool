class MileSplit {
  constructor() {
    throw new Error('The MileSplit class should not be constructed')
  }

  static _search(query) {
    const json = fetchJson(
      `https://www.milesplit.com/api/v1/athletes/search?q=${encodeURIComponent(
        query
      )}`
    )
    return json.data
  }
  static search(query) {
    return MileSplit._search(query).map((result) => ({
      id: result.id,
      name: [result.firstName, result.lastName].filter((s) => s).join(' '),
      school: result.schoolName,
      city: result.city,
      state: result.state,
      service: 'MileSplit',
    }))
  }
  static findAthlete(query) {
    const searchResults = MileSplit.search(query)
    const topResult = searchResults[0]
    const athlete = new MileSplitAthlete(topResult.id)
    athlete.load()
    return athlete
  }
}

class MileSplitAthlete {
  constructor(id) {
    this.id = id
    this.service = 'MileSplit'
    this.loaded = false

    this.times = []
  }

  load() {
    const statsJson = fetchJson(
      `https://www.milesplit.com/api/v1/athletes/${this.id}/stats`
    )
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

const mileSplitPrettyMatchers = [
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
const mileSplitMetersMatchers = [
  [/^(\d+)(?:m(?:SC)?|h|rw)$/i, (s) => parseInt(s)],
  [/(\d+(?:\.\d+)?)mile/i, (s) => parseFloat(s) * 1609.344],
]

class MileSplitTime {
  constructor(data) {
    this._data = data
    this.service = 'MileSplit'
    this.loaded = false

    this.date = undefined
    this._meet = undefined
  }
  load() {
    const meetJson = fetchJson(
      `https://www.milesplit.com/api/v1/meets/${this._data.meetId}`
    )
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
