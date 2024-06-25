function clearData(sheet) {
  const headerRows = sheet.getFrozenRows()
  const headerColumns = sheet.getFrozenColumns()
  const lastRow = sheet.getLastRow()
  const lastColumn = sheet.getLastColumn()

  if (lastRow > headerRows) {
    sheet
      .getRange(
        headerRows + 1,
        headerColumns + 1,
        lastRow - headerRows,
        lastColumn - headerColumns
      )
      .clearContent()
  }
}

const jsonCache = new Map()
function fetchJson(url) {
  const cached = jsonCache.get(url)
  if (cached) return JSON.parse(cached)

  const response = UrlFetchApp.fetch(url).getContentText()
  jsonCache.set(url, response)

  const json = JSON.parse(response)
  return json
}

function parseTime(timeString) {
  const parts = timeString.split(':')
  if (parts.length > 2 || timeString.includes('-')) {
    console.error(`Don't know how to parse this time: ${timeString}`)
    return null
  }
  const [minutesPart, secondsPart] = parts
  const time = parseFloat(minutesPart || '0') * 60 + parseFloat(secondsPart)
  if (isNaN(time)) {
    console.error(`Don't know how to parse this time: ${timeString}`)
    return null
  }
  return time
}

function evaluateMatchers(input, matchers, defaultValue) {
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
        return format(matchValue)
      } else {
        return format
      }
    }
  }
  return defaultValue
}

function approxSame(a, b) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'string') {
    const result = a.localeCompare(b, 'en-US', {
      usage: 'search',
      sensitivity: 'base',
      ignorePunctuation: true,
    })
    return result === 0
  }
  if (typeof a === 'number') {
    return Math.abs(a - b) < 1e-5
  }
  return a === b
}

function pickVersion(
  versions,
  {
    filter = (v) => v,
    forceFilter = false,
    defaultValue = undefined,
    comparision = approxSame,
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
  const counts = new Map()
  filteredVersions.forEach((version) => {
    const matchingCountedVersion = [...counts.keys()].find((countedVersion) =>
      comparision(countedVersion, version)
    )
    if (matchingCountedVersion) {
      const existingCount = counts.get(matchingCountedVersion)
      counts.set(matchingCountedVersion, existingCount + 1)
    } else {
      counts.set(version, 1)
    }
  })

  const sortedVersions = filteredVersions.sort((a, b) => {
    const countA = counts.get(a)
    const countB = counts.get(b)
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
