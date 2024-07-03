import {
  type Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  CoreHeader,
} from '@tanstack/react-table'
import type { tableData } from './Scraper'
import styles from './Scraper.module.css'
import { Temporal } from 'temporal-polyfill'

function formatTime(time: Temporal.Duration) {
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

const columnHelper = createColumnHelper<tableData>()

const columns = [
  columnHelper.accessor('meet', {
    header: 'Meet',
    sortingFn: 'alphanumeric',
    sortUndefined: 'last',
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => {
      const date = info.getValue()
      if (!date) return ''
      return date.toLocaleString(undefined, {
        dateStyle: 'long',
      })
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.date ?? Temporal.PlainDate.from('1337-01-01')
      const b = rowB.original.date ?? Temporal.PlainDate.from('1337-01-01')
      if (!a || !b) return 0
      return Temporal.PlainDate.compare(a, b)
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('event', {
    header: 'Event',
    sortingFn: (rowA, rowB) => {
      const metersA = rowA.original.meters ?? -1
      const metersB = rowB.original.meters ?? -1
      const metersDifference = metersA - metersB
      if (Math.abs(metersDifference) > 0.01) {
        if (metersDifference < 0) return -1
        if (metersDifference > 0) return 1
        return 0
      }
      const eventA = rowA.original.event ?? ''
      const eventB = rowB.original.event ?? ''
      return eventA.localeCompare(eventB, 'en-US-u-kn')
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('time', {
    header: 'Time',
    cell: (info) => {
      const time = info.getValue()
      if (!time) return ''
      return formatTime(time)
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.time
      const b = rowB.original.time
      if (!a || !b) return 0
      return Temporal.Duration.compare(a, b)
    },
    sortUndefined: 'last',
  }),
]

export function TimesTable({ data }: { data: tableData[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className={styles.timesTable}>
      <div className={styles.header}>
        {table.getFlatHeaders().map((header) => (
          <span key={header.id} className={styles.headerItem}>
            <Header header={header} />
          </span>
        ))}
      </div>

      {table.getRowModel().rows.map((row) => (
        <div key={row.id} className={styles.row}>
          {row.getAllCells().map((cell) => (
            <span key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function Header({ header }: { header: CoreHeader<tableData, unknown> }) {
  const label = flexRender(header.column.columnDef.header, header.getContext())
  const sort = header.column.getIsSorted()

  return (
    <button onClick={() => header.column.toggleSorting()}>
      {label}
      <SortIcon sort={sort} />
    </button>
  )
}

function SortIcon({ sort }: { sort: false | 'asc' | 'desc' }) {
  const sortIcon =
    sort === 'asc' ? (
      <svg
        className={styles.sortIcon}
        aria-label="sorted ascending"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M 3, 6
            L 8, 11
            L 13, 6
          "
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    ) : sort === 'desc' ? (
      <svg
        className={styles.sortIcon}
        aria-label="sorted descending"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M 3, 11
            L 8, 6
            L 13, 11
          "
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    ) : (
      <svg
        className={styles.sortIcon}
        aria-label="sorted descending"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="
            M 3, 10
            L 8, 15
            L 13, 10
          "
          stroke="#aaa"
          strokeWidth="2"
        />
        <path
          d="
            M 3, 6
            L 8, 1
            L 13, 6
          "
          stroke="#aaa"
          strokeWidth="2"
        />
      </svg>
    )

  return sortIcon
}
