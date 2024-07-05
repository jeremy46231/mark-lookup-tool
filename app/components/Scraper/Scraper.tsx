'use client'

import { useId, useState } from 'react'
import styles from './Scraper.module.css'
import { runScraper, type passedData } from './runScraper'
import { DataView } from '@/app/components/DataView/DataView'

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