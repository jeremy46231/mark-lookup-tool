'use client'

import { useId, useState } from 'react'
import styles from './Scraper.module.css'
import { searchSources, type passedData, type searchResults } from './runScraper'
import { DataView } from '@/app/components/DataView/DataView'

export function Scraper() {
  const [query, setQuery] = useState('Dathan Ritzenhein')
  const [searchResults, setSearchResults] = useState<searchResults | null>(null)
  const [data, setData] = useState<passedData | null>(null)
  const searchInputID = useId()

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setData(null)
      return
    }
    const results = await searchSources(query)
    setSearchResults(results)
    console.log(results)
  }

  return (
    <div className={styles.scraper}>
      <form className={styles.search} onSubmit={search}>
        <label htmlFor={searchInputID}>Search: </label>
        <input
          id={searchInputID}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {searchResults && (
        <>
          {searchResults.map(service => (
            <></> // TODO: Implement this
          ))}
        </>
      )}

      {data && <DataView data={data} />}
    </div>
  )
}