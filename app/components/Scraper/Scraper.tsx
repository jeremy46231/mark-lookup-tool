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

      <table className={styles.timesTable}>
        <thead>
          <tr>
            <th>Meet</th>
            <th>Date</th>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {data.times.map((time, i) => (
            <tr key={i}>
              <td>{time.meet}</td>
              <td>
                {time.date
                  ? Temporal.PlainDate.from(time.date).toLocaleString(
                      undefined,
                      { dateStyle: 'long' }
                    )
                  : ''}
              </td>
              <td>{time.event}</td>
              <td>{time.timeString}</td>
              {'debug' in time && <td>{JSON.stringify(time.debug)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
