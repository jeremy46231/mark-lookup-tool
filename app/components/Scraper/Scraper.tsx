'use client'

import { useCallback, useEffect, useId, useState } from 'react'
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
import { useDebounce } from '@/app/helpers'

export function Scraper() {
  // State

  const [query, setQuery] = useState('')
  const [shouldSearch, setShouldSearch] = useState(false)

  const [searchResults, setSearchResults] = useState<searchResults | null>(null)
  const [selectedResults, setSelectedResults] =
    useState<selectedResults | null>(null)

  const [data, setData] = useState<passedData | null>(null)
  const searchInputID = useId()

  const [startInputDebounce, waitForInputDebounce] = useDebounce()

  // Event handlers

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      startInputDebounce(500)
    },
    [startInputDebounce]
  )

  const handleQuerySubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (query.trim() === '') return
      setShouldSearch(true)
      startInputDebounce(0)
    },
    [query, startInputDebounce]
  )

  const reset = useCallback(() => {
    setShouldSearch(false)
    setQuery('')
    setSearchResults(null)
    setSelectedResults(null)
    setData(null)
  }, [])

  const handleSetSelectedResults = useCallback(
    (newSelectedResults: selectedResults) => {
      startInputDebounce(500)
      if (newSelectedResults.every((result) => result.results.length === 0)) {
        setSelectedResults(null)
        return
      }
      setSelectedResults(newSelectedResults)
    },
    [startInputDebounce]
  )

  // Effects

  useEffect(() => {
    if (!shouldSearch) return
    const controller = new AbortController()

    ;(async () => {
      await waitForInputDebounce()
      if (controller.signal.aborted) return
      if (!query.trim()) {
        setSearchResults(null)
        return
      }
      const results = await searchSources(query)
      if (controller.signal.aborted) return
      console.log('searched')
      setSearchResults(results)
      setSelectedResults(
        (selectedResults) =>
          selectedResults ||
          results.map((service) => ({
            serviceId: service.serviceId,
            results: service.searchResults[0] ? [service.searchResults[0]] : [],
          }))
      )
    })()

    return () => controller.abort()
  }, [query, shouldSearch, waitForInputDebounce])

  useEffect(() => {
    const controller = new AbortController()

    ;(async () => {
      await waitForInputDebounce()
      if (controller.signal.aborted) return
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
      if (controller.signal.aborted) return
      setData(athlete)
    })()

    return () => controller.abort()
  }, [selectedResults, waitForInputDebounce])

  // Render

  return (
    <div className={styles.scraper}>
      <div className={styles.search}>
        <form className={styles.query} onSubmit={handleQuerySubmit}>
          <label htmlFor={searchInputID}>Search: </label>
          <input
            id={searchInputID}
            type="text"
            value={query}
            onChange={handleQueryChange}
            size={10}
            autoComplete='name'
            placeholder=' ' // Fix safari alignment bug - https://bugs.webkit.org/show_bug.cgi?id=142968
          />
          {!shouldSearch ? (
            <button type="submit">Search</button>
          ) : (
            <button type="button" onClick={reset}>
              Reset
            </button>
          )}
        </form>
        {(searchResults || selectedResults) && (
          <SearchResults
            searchResults={searchResults ?? []}
            selectedResults={selectedResults ?? []}
            setSelectedResults={handleSetSelectedResults}
          />
        )}
      </div>

      {data && <DataView data={data} />}
    </div>
  )
}
