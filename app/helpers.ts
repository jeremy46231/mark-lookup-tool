import { Temporal } from 'temporal-polyfill'
import type { tableData } from './components/Scraper/Scraper'
import type { Column } from '@tanstack/react-table'

export function formatTime(time: Temporal.Duration) {
  const rounded = Temporal.Duration.from(time).round({ largestUnit: 'hour' })
  const seconds =
    rounded.seconds +
    rounded.milliseconds / 1_000 +
    rounded.microseconds / 1_000_000
  // prettier-ignore
  return `${
      time.hours > 0 ? `${rounded.hours.toFixed(0)}:` : ''
    }${
      rounded.minutes.toFixed(0).padStart(2, '0')
    }:${
      seconds.toFixed(2).padStart(5, '0')
    }`
}

export function getMinMaxDates(column: Column<tableData, Temporal.PlainDate>) {
  const values = column
    .getFacetedRowModel()
    .rows.map(
      (row) =>
        (row.original as Record<string, Temporal.PlainDate | undefined>)[
          column.id
        ]
    )
  let min = Temporal.PlainDate.from('9999-12-31')
  let max = Temporal.PlainDate.from('0001-01-01')
  for (const value of values) {
    if (!value) continue
    if (Temporal.PlainDate.compare(value, min) < 0) min = value
    if (Temporal.PlainDate.compare(value, max) > 0) max = value
  }
  return [min, max]
}
