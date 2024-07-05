import { createColumnHelper, RowData } from '@tanstack/react-table'
import { tableData } from '@/app/components/DataView/DataView'
import { formatTime } from '../../helpers'
import { Temporal } from 'temporal-polyfill'

const columnHelper = createColumnHelper<tableData>()

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterInputType?: 'text' | 'datalist' | 'date' | 'none'
    filterInputProps?: React.InputHTMLAttributes<HTMLInputElement>
  }
}

export const columns = [
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
