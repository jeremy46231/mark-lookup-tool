export type AthleticNetAPISearch = {
  responseHeader: {
    status: number
    QTime: number
  }
  response: {
    numFound: number
    start: number
    maxScore: number
    numFoundExact: boolean
    docs: {
      id_db: string
      type: string
      gender: string
      textsuggest: string
      subtext: string
      tf?: string
      xc?: string
      l: number[]
      score: number
    }[]
  }
}
type AthleticNetAPIGenericAthlete = {
  level: number
  athlete: {
    IDAthlete: number
    SchoolID: number
    FirstName: string
    LastName: string
    Gender: string
    NoSearch: boolean
    UsatfId: null
    age: null
    isClaimed: boolean
    PhotoUrl: null
    Handle: string
  }
  canEdit: boolean
  hasOtherSport: boolean
  allSeasons: {
    SchoolID: number
    IDSeason: number
    Display: string
    Selected: boolean
    age: null
  }[]
  allTeams: {
    [key: string]: {
      Level: number
      IDSchool: number
      SchoolName: string
      TeamCode: string
      MascotUrl: string
      PrefMetric: number
      PrefConvert: number
      Year: number
    }
  }
  grades: { [key: string]: number }
  meets: {
    [key: string]: {
      IDMeet: number
      MeetName: string
      EndDate: string
    }
  }
  photos: any[]
  unattachedCalendars: {}
  synonyms: any[]
}
export type AthleticNetAPIXCAthlete = AthleticNetAPIGenericAthlete & {
  resultsTF: null
  eventsTF: null
  resultsXC: {
    IDResult: number
    AthleteID: number
    Result: string
    SortValue: number
    Place: number
    PersonalBest: boolean
    SeasonBest: boolean
    SchoolID: number
    Distance: number
    MeetID: number
    Division: string
    SeasonID: number
    MediaCount: {}
    shortCode: string
  }[]
  distancesXC: {
    Meters: number
    Distance: number
    Units: string
  }[]
  relayTeamMembers: null
}
export type AthleticNetAPITFAthlete = AthleticNetAPIGenericAthlete & {
  resultsTF: {
    IDResult: number
    AthleteID: number
    Result: string
    SortInt: number
    SortIntRaw: number
    FAT: number
    Place: string
    PersonalBest: number
    Round: string
    Wind: null
    SeasonBest: number
    Division: string
    DivisionShort: string
    SchoolID: number
    EventID: number
    EventTypeID: number
    MeetID: number
    SeasonID: number
    MediaCount: {}
    shortCode: string
  }[]
  eventsTF: {
    Event: string
    Type: string
    Description: null
    IDEvent: number
    DefaultSortOrder: number
    IDEventType: number
    ConversionInt: number
    PersonalEvent: boolean
    FieldMeasureType: null
  }[]
  resultsXC: null
  distancesXC: null
  relayTeamMembers: null
}