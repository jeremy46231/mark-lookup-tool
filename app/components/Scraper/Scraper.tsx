'use client'

import { use, useId, useMemo, useState } from 'react'
import { Temporal } from 'temporal-polyfill'
import styles from './Scraper.module.css'
import { runScraper, type passedData } from './runScraper'
import { TimesTable } from './TimesTable'

export function Scraper() {
  const [query, setQuery] = useState('Dathan Ritzenhein')
  const [data, setData] = useState<passedData | null>(null)
  const searchInputID = useId()

  const load = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setData(null)
      return
    }
    setData(await runScraper(query))
  }

  return (
    <div className={styles.scraper}>
      <form className={styles.search} onSubmit={load}>
        <label htmlFor={searchInputID}>Search: </label>
        <input
          id={searchInputID}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Load</button>
      </form>
      {data && <DataView data={data} />}
    </div>
  )
}

const makeTableData = (data: passedData) =>
  data.times.map((time) => {
    return {
      meet: time.meet ?? undefined,
      date: time.date ? Temporal.PlainDate.from(time.date) : undefined,
      event: time.event ?? undefined,
      time: time.time
        ? Temporal.Duration.from({
            milliseconds: Math.round(time.time * 1000),
          }).round({
            largestUnit: 'hour',
          })
        : undefined,
    }
  })
export type tableData = ReturnType<typeof makeTableData>[number]

function DataView({ data }: { data: passedData }) {
  const tableData = useMemo(() => makeTableData(data), [data])

  return (
    <div className={styles.dataView}>
      <div className={styles.name}>
        {data.pfpUrl && (
          <span className={styles.pfp}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.pfpUrl} alt={`${data.name}'s profile picture`} />
          </span>
        )}
        {data.name ?? ''}
      </div>

      <TimesTable data={tableData} />
    </div>
  )
}
