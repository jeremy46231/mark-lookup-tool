'use client'

import { use, useId, useState } from 'react'
import { Temporal } from 'temporal-polyfill'
import styles from './Scraper.module.css'
import { runScraper, type passedData } from './runScraper'

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

function DataView({ data }: { data: passedData }) {
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

      <div className={styles.timesTable}>
        <div className={styles.header}>
          <span>Meet</span>
          <span>Date</span>
          <span>Event</span>
          <span>Time</span>
        </div>

        {data.times.map((time, i) => (
          <div key={i}>
            <span>{time.meet}</span>
            <span>
              {time.date
                ? Temporal.PlainDate.from(time.date).toLocaleString(undefined, {
                    dateStyle: 'long',
                  })
                : ''}
            </span>
            <span>{time.event}</span>
            <span>{time.timeString}</span>
            {/* {'debug' in time && <span>{JSON.stringify(time.debug)}</span>} */}
          </div>
        ))}
      </div>
    </div>
  )
}
