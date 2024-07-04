'use client'

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
  getFacetedMinMaxValues,
} from '@tanstack/react-table'
import type { tableData } from '@/app/components/Scraper/Scraper'
import styles from './TimesTable.module.css'
import { Temporal } from 'temporal-polyfill'
import React, { useId, useMemo } from 'react'
import { columns } from './tableDefinition'
import { getMinMaxDates } from '@/app/helpers'

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

  return (
    <span className={styles.headerItem} {...props}>
      <button onClick={() => header.column.toggleSorting()}>
        <span>{label}</span>
        <SortIcon sort={sort} />
      </button>
      <FilterInput column={header.column} label={String(label)}></FilterInput>
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

function FilterInput({
  column,
  label,
}: {
  column: Column<tableData, unknown>
  label: string
}) {
  const filterInputType = column.columnDef.meta?.filterInputType ?? 'none'
  const filterInputProps = column.columnDef.meta?.filterInputProps ?? {}
  const datalistId = useId()

  switch (filterInputType) {
    case 'text':
      return (
        <input
          type="text"
          onChange={(e) => {
            column.setFilterValue(e.target.value)
          }}
          placeholder="Filter"
          aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
          {...filterInputProps}
        ></input>
      )
    case 'datalist':
      return (
        <>
          <datalist id={datalistId}>
            {[
              ...(
                column.getFacetedUniqueValues() as Map<string, number>
              ).keys(),
            ].map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <input
            list={datalistId}
            onChange={(e) => {
              column.setFilterValue(e.target.value)
            }}
            placeholder="Filter"
            aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
            {...filterInputProps}
          ></input>
        </>
      )
    case 'date':
      const [minDate, maxDate] = getMinMaxDates(
        column as Column<tableData, Temporal.PlainDate>
      )
      return (
        <input
          type="date"
          min={minDate.toString()}
          max={maxDate.toString()}
          onChange={(e) => {
            if (!e.target.value) {
              column.setFilterValue(undefined)
              return
            }
            const date = Temporal.PlainDate.from(e.target.value)
            column.setFilterValue(date)
          }}
          aria-label={`filter ${String(label).toLocaleLowerCase()} column`}
          {...filterInputProps}
        ></input>
      )
    case 'none':
    default:
      return null
  }
}
