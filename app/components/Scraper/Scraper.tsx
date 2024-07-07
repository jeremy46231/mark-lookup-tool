'use client'

import { useId, useState } from 'react'
import styles from './Scraper.module.css'
import {
  getAthletes,
  searchSources,
  type passedData,
  type searchResults,
} from './runScraper'
import { DataView } from '@/app/components/DataView/DataView'
import {
  SearchResults,
  type selectedResults,
} from '@/app/components/SearchResults/SearchResults'
import { debounce } from '@/app/helpers'

export function Scraper() {
  const [query, setQuery] = useState('Dathan Ritzenhein')

  const [searchResults, setSearchResults] = useState<searchResults | null>(null)
  const [selectedResults, setSelectedResults] =
    useState<selectedResults | null>(null)

  const [data, setData] = useState<passedData | null>(null)
  const searchInputID = useId()

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    const results = await searchSources(query)
    setSearchResults(results)
    setSelectedResults(
      (selectedResults) =>
        selectedResults ||
        results.map((service) => ({
          serviceId: service.serviceId,
          results: service.searchResults[0] ? [service.searchResults[0]] : [],
        }))
    )
    load()
    console.log(results)
  }

  const load = debounce(async () => {
    if (!selectedResults) {
      setData(null)
      return
    }
    const ids = selectedResults.flatMap(({ serviceId, results }) =>
      results.map(
        (result) => [result.id, serviceId] as [id: string, service: string]
      )
    )
    const athlete = await getAthletes(ids)
    console.log(athlete)
    setData(athlete)
  }, 500)

  const handleSetSelectedResults = (newSelectedResults: selectedResults) => {
    if (
      searchResults === null &&
      newSelectedResults.every((result) => result.results.length === 0)
    ) {
      setSelectedResults(null)
      return
    }
    setSelectedResults(newSelectedResults)
    load()
  }

  return (
    <div className={styles.scraper}>
      <div className={styles.search}>
        <form className={styles.query} onSubmit={search}>
          <label htmlFor={searchInputID}>Search: </label>
          <input
            id={searchInputID}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {selectedResults && (
          <SearchResults
            results={searchResults ?? [] /* TODO: This default array does not work properly */}
            selectedResults={selectedResults}
            setSelectedResults={handleSetSelectedResults}
          />
        )}
      </div>

      {data && <DataView data={data} />}
    </div>
  )
}
