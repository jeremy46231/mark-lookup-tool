import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { tableData } from './Scraper'
import styles from './Scraper.module.css'

const columnHelper = createColumnHelper<tableData>()

const columns = [
  columnHelper.accessor('meet', {
    header: 'Meet',
  }),
  columnHelper.accessor('dateString', {
    header: 'Date',
  }),
  columnHelper.accessor('event', {
    header: 'Event',
  }),
  columnHelper.accessor('timeString', {
    header: 'Time',
  }),
]

export function TimesTable({ data }: { data: tableData[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={styles.timesTable}>
      {table.getHeaderGroups().map((headerGroup) => (
        <div className={styles.header} key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <span key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          ))}
        </div>
      ))}

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
