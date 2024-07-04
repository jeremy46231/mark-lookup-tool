import {
  type Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  CoreHeader,
  getFilteredRowModel,
  type RowData,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table'
import type { tableData } from './Scraper'
import styles from './Scraper.module.css'
import { Temporal } from 'temporal-polyfill'
import React, { useId, useMemo } from 'react'

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

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterInputType?: 'text' | 'datalist' | 'date' | 'none'
    filterInputProps?: React.InputHTMLAttributes<HTMLInputElement>
  }
}

const columns = [
  columnHelper.accessor('meet', {
    header: 'Meet',
    sortingFn: 'alphanumeric',
    sortUndefined: 'last',
    meta: {
      filterInputType: 'text',
      filterInputProps: {
        size: 10,
      },
    },
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
    filterFn: (row, _columnId, filterValue: Temporal.PlainDate) => {
      const date = row.original.date
      if (!date) return false
      return filterValue.equals(date)
    },
    meta: {
      filterInputType: 'date',
    },
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
    meta: {
      filterInputType: 'datalist',
      filterInputProps: {
        size: 5,
      },
    },
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
    meta: {
      filterInputType: 'none', // TODO: time input
    },
  }),
]

export function TimesTable({ data }: { data: tableData[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className={styles.timesTable}>
      <div className={styles.header}>
        {table.getFlatHeaders().map((header) => (
          <Header header={header} key={header.id} />
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

function Header({
  header,
  props,
}: {
  header: CoreHeader<tableData, unknown>
  props?: Record<string, unknown>
}) {
  const label = flexRender(header.column.columnDef.header, header.getContext())
  const sort = header.column.getIsSorted()

  const filterInputType =
    header.column.columnDef.meta?.filterInputType ?? 'none'
  const filterInputProps = header.column.columnDef.meta?.filterInputProps ?? {}
  const datalistId = useId()

  let filterInput = null
  switch (filterInputType) {
    case 'text':
      filterInput = (
        <input
          type="text"
          onChange={(e) => {
            header.column.setFilterValue(e.target.value)
          }}
          placeholder="Filter"
          aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
          {...filterInputProps}
        ></input>
      )
      break
    case 'datalist':
      filterInput = (
        <>
          <datalist id={datalistId}>
            {[
              ...(
                header.column.getFacetedUniqueValues() as Map<string, number>
              ).keys(),
            ].map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <input
            list={datalistId}
            onChange={(e) => {
              header.column.setFilterValue(e.target.value)
            }}
            placeholder="Filter"
            aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
            {...filterInputProps}
          ></input>
        </>
      )
      break
    case 'date':
      filterInput = (
        <input
          type="date"
          onChange={(e) => {
            if (!e.target.value) {
              header.column.setFilterValue(undefined)
              return
            }
            const date = Temporal.PlainDate.from(e.target.value)
            header.column.setFilterValue(date)
          }}
          aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
          {...filterInputProps}
        ></input>
      )
      break
    case 'none':
      filterInput = null
      break
  }

  return (
    <span className={styles.headerItem} {...props}>
      <button onClick={() => header.column.toggleSorting()}>
        <span>{label}</span>
        <SortIcon sort={sort} />
      </button>
      {filterInput}
    </span>
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
