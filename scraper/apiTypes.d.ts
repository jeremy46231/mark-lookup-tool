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
type AthleticNetAPIAthleteCommon = {
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
export type AthleticNetAPIXCAthlete = AthleticNetAPIAthleteCommon & {
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
export type AthleticNetAPITFAthlete = AthleticNetAPIAthleteCommon & {
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
export type AthleticNetAPIAthlete =
  | AthleticNetAPIXCAthlete
  | AthleticNetAPITFAthlete

export type MileSplitAPISearch = {
  _meta: {
    created: number
    cache: {
      fresh: boolean
      ttl: number
    }
    status_code: number
  }
  _links: {
    self: {
      href: string
      method: string
    }
  }
  data: {
    id: string
    firstName: string
    lastName: string
    city: string
    state: string
    country: string
    schoolName: string
    collegeName: null
  }[]
}
export type MileSplitAPIAthlete = {
  _meta: {
    created: number
    cache: {
      fresh: boolean
      ttl: number
    }
    status_code: number
  }
  _links: {
    self: {
      href: string
      method: string
    }
    up: {
      href: string
      method: string
    }
  }
  _embedded: {
    athlete: {
      id: string
      siteSubdomain: string
      firstName: string
      lastName: string
      slug: string
      gender: string
      schoolId: string
      gradYear: string
      collegeYear: string
      collegeId: string
      nickname: string
      birthDate: string
      birthYear: string
      note: string
      honors: string
      specialty: string
      city: string
      state: string
      country: string
      isProfilePhoto: string
      hide: string
      usatf: null
      tfrrsId: null
      lastTouch: string
      teamId: string
      profilePhotoUrl: string
    }
  }
  data: {
    id: string
    eventCode: string
    meetId: string
    season: string
    round: string
    units: string
    meetName: string
    mark: string
  }[]
}
export type MileSplitAPIMeet = {
  _meta: {
    created: number
    cache: {
      fresh: boolean
      ttl: number
    }
    status_code: number
  }
  _links: {
    self: {
      href: string
      method: string
    }
    list: {
      href: string
      method: string
    }
  }
  data: {
    id: string
    name: string
    dateStart: string
    dateEnd: string
    season: string
    seasonYear: string
    venueCity: string
    venueState: string
    venueCountry: string
    registrationActive: null
  }
}
