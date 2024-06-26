'use client'

import Image from 'next/image'
import { useState } from 'react'
import { runScraper, type passedData } from './runScraper'
import { Temporal } from 'temporal-polyfill'

export function Scraper() {
  const [query, setQuery] = useState('Dathan Ritzenhein')
  const [data, setData] = useState<passedData>({
    name: '',
    pfpUrl: '',
    urls: [],
    times: [],
  })

  const load = async (e: React.FormEvent) => {
    e.preventDefault()
    setData(await runScraper(query))
  }

  return (
    <div>
      <form onSubmit={load}>
        <label>
          Query:
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit">Load</button>
      </form>
      <h1>
        {data.pfpUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.pfpUrl}
              alt="Profile Picture"
              style={{
                height: '1.5em',
                // aspectRatio: '1/1',
              }}
            />{' '}
          </>
        )}
        {data.name ?? ''}
      </h1>

      <table>
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
