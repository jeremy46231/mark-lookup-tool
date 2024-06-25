function fetchTimes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1')
  clearData(sheet)
  sheet.getRange(1, 2, 1, sheet.getLastColumn() - 1).clearContent() // clear urls

  const name = sheet.getRange(1, 1).getValue()
  const athlete = Scraper.findAthlete(name)

  const formulaEscape = (string) => string.replace('"', '"&CHAR(34)&"')
  const urlData = [
    athlete.urls.map((url) => {
      let label = 'Profile'
      if (url.includes('athletic.net')) {
        label = 'Athletic.net'
        if (url.includes('cross-country')) {
          label = 'Athletic.net XC'
        } else if (url.includes('track-and-field')) {
          label = 'Athletic.net T&F'
        }
      } else if (url.includes('milesplit')) {
        label = 'MileSplit'
      }
      return `=HYPERLINK("${formulaEscape(url)}", "${formulaEscape(label)}")`
    }),
  ]
  sheet.getRange(1, 2, 1, urlData[0].length).setValues(urlData)

  writeTimes(sheet, athlete)
}

function writeTimes(sheet, athlete) {
  const data = athlete.times.map((time) => [
    time.meet,
    time.date.toString(),
    time.event,
    time.timeString,
    time.meters,
    time.timeSeconds,
    time.sources
      .map((source) => source.service)
      .sort()
      .join(', '),
  ])

  const range = sheet.getRange(
    sheet.getFrozenRows() + 1,
    sheet.getFrozenColumns() + 1,
    data.length,
    data[0].length
  )
  range.setValues(data)
}

function handleEdit(e) {
  if (e.range.getA1Notation() === 'A1') fetchTimes()
}
