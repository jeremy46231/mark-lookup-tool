import { Temporal } from 'temporal-polyfill'
import type { tableData } from './components/DataView/DataView'
import type { Column } from '@tanstack/react-table'
import { useCallback, useRef } from 'react'

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

export function debounce<A extends unknown[]>(
  callback: (...args: A[]) => void,
  waitMs: number
) {
  let timeoutId: null | number = null
  return (...args: A[]) => {
    window.clearTimeout(timeoutId ?? undefined)
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args)
    }, waitMs)
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Triggering startDelay(ms) will make all waitForDelay() calls wait for the delay to pass.
 * Calling startDelay(ms) again during the delay will reset the delay.
 */
export function useDebounce(): [
  startDebounce: (delayMs: number) => void,
  waitForDebounce: () => Promise<void>
] {
  const resolveFuncs = useRef<(() => void)[]>([])
  const timer = useRef<number | undefined>(undefined)

  const startDebounce = useCallback((delayMs: number) => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = undefined
    }
    timer.current = setTimeout(() => {
      for (const resolve of resolveFuncs.current) {
        resolve()
      }
      resolveFuncs.current = []
      timer.current = undefined
    }, delayMs) as unknown as number
  }, [])

  const waitForDebounce = useCallback(() => {
    if (!timer.current) return Promise.resolve()
    return new Promise<void>((resolve) => {
      resolveFuncs.current.push(resolve)
    })
  }, [])

  return [startDebounce, waitForDebounce]
}