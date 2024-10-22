// export type TODO = any

export function parseTime(timeString: string) {
  if (typeof timeString !== 'string') {
    console.error(`Don't know how to parse this time: ${timeString}`)
    return null
  }
  const parts = timeString.split(':')
  if (parts.length > 3 || timeString.includes('-')) {
    console.error(`Don't know how to parse this time: ${timeString}`)
    return null
  }
  const secondsPart = parts.pop() || '0'
  const minutesPart = parts.pop() || '0'
  const hoursPart = parts.pop() || '0'
  const time =
    parseFloat(secondsPart) +
    parseFloat(minutesPart) * 60 +
    parseFloat(hoursPart) * 3600
  if (isNaN(time)) {
    console.error(`Don't know how to parse this time: ${timeString}`)
    return null
  }
  return time
}

export function formatMeters(meters?: string) {
  if (!meters) return 'NaN'
  const number = parseFloat(meters)
  if (isNaN(number)) return 'NaN'
  if (number >= 1000) {
    const kilometers = number / 1000
    if (kilometers % 1 === 0 || kilometers > 10) return `${kilometers}k`
  }
  return `${meters}m`
}

export type Matcher<Result> = [
  matcher: string | RegExp,
  replacer: Result | ((match?: string) => Result)
]

export function evaluateMatchers<T extends unknown>(
  input: string,
  matchers: Matcher<T>[],
  defaultValue: T
) {
  for (const [matcher, format] of matchers) {
    let match = false
    let matchValue = undefined
    if (!(matcher instanceof RegExp)) {
      if (input === matcher) match = true
    } else {
      const matchResult = input.match(matcher)
      if (matchResult) {
        match = true
        matchValue = matchResult[1]
      }
    }
    if (match) {
      if (typeof format === 'function') {
        return (format as (match?: string | undefined) => T)(matchValue)
      } else {
        return format
      }
    }
  }
  return defaultValue
}

export function approxSame(a: unknown, b: unknown) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'string' && typeof b === 'string') {
    const result = a.localeCompare(b, 'en-US', {
      usage: 'search',
      sensitivity: 'base',
      ignorePunctuation: true,
    })
    return result === 0
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 1e-5
  }
  return a === b
}

export function pickVersion<T extends unknown>(
  versions: T[],
  defaultValue: T,
  {
    filter = (v: T) => !!v,
    forceFilter = false,
    comparision = approxSame,
  }: {
    filter?: ((v: T) => boolean) | string | RegExp
    forceFilter?: boolean
    comparision?: (a: T, b: T) => boolean
  } = {}
) {
  if (versions.length === 0) return defaultValue
  if (!forceFilter && versions.length === 1) return versions[0] // if forceFilter is on and filter removes the only value, we can't return yet

  let filteredVersions = versions // preserve original versions array for later
  if (filter) {
    // apply filter if it exists
    if (typeof filter === 'function') {
      filteredVersions = versions.filter(filter)
    } else if (typeof filter === 'string') {
      filteredVersions = versions.filter((v) => typeof v === filter)
    } else if (filter instanceof RegExp) {
      filteredVersions = versions.filter(
        (v) => typeof v === 'string' && filter.exec(v)
      )
    }
  }
  if (filteredVersions.length === 1) {
    // sweet, we're done
    return filteredVersions[0]
  } else if (filteredVersions.length === 0) {
    // nothing passes the filter, oh no
    if (forceFilter) return defaultValue // nothing we can do
    filteredVersions = versions // we'll just ignore the filter
  }

  // Count how many of each version there are
  const counts: Map<T, number> = new Map()
  filteredVersions.forEach((version) => {
    const matchingCountedVersion = [...counts.keys()].find((countedVersion) =>
      comparision(countedVersion, version)
    )
    if (matchingCountedVersion) {
      const existingCount = counts.get(matchingCountedVersion)!
      counts.set(matchingCountedVersion, existingCount + 1)
    } else {
      counts.set(version, 1)
    }
  })

  const sortedVersions = filteredVersions.sort((a, b) => {
    const countA = counts.get(a) ?? 0
    const countB = counts.get(b) ?? 0
    if (countA !== countB) {
      return countB - countA // 1st, prioritize more common versions
    } else {
      if (typeof a === 'string' && typeof b === 'string') {
        return b.length - a.length // 2nd, prioritize longer strings
      } else {
        return 0
      }
    }
  })

  const mostCommonVersion = sortedVersions[0]
  return mostCommonVersion
}
