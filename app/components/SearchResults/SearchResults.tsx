import { produce } from 'immer'
import type { searchResults } from '@/app/components/Scraper/runScraper'
import type { searchResult } from '@/scraper/service'
import styles from './SearchResults.module.css'
// import { useState } from 'react'

export type selectedResults = {
  serviceId: string
  results: searchResult[]
}[]

export function SearchResults({
  searchResults,
  selectedResults,
  setSelectedResults,
}: {
  searchResults: searchResults
  selectedResults: selectedResults
  setSelectedResults: (results: selectedResults) => void
}) {
  /*
  const [selectedResults, setSelectedResults] = useState<selectedResults>(() =>
    results.map((service) => ({
      serviceId: service.serviceId,
      results: service.searchResults[0] ? [service.searchResults[0]] : [],
    }))
  )
  */

  const serviceIds = new Set([
    ...searchResults.map((service) => service.serviceId),
    ...selectedResults.map((result) => result.serviceId),
  ])

  const displayedResults = [...serviceIds].map((serviceId) => {
    const thisSearchResults =
      searchResults.find((service) => service.serviceId === serviceId)
        ?.searchResults ?? []
    const thisSelectedResults =
      selectedResults.find((result) => result.serviceId === serviceId)
        ?.results ?? []

    const selectedOnlyResults = thisSelectedResults.filter(
      (result) =>
        !thisSearchResults.some((otherResult) => result.id === otherResult.id)
    )
    const selectedResultIds = new Set(
      thisSelectedResults.map((result) => result.id)
    )
    return {
      serviceId,
      results: [...selectedOnlyResults, ...thisSearchResults],
      selectedResultIds,
    }
  })

  return (
    <form className={styles.results}>
      {displayedResults.map((service) => (
        <ResultSet
          key={service.serviceId}
          serviceId={service.serviceId}
          results={service.results}
          selectedResultIds={service.selectedResultIds}
          selectResult={(resultId) => {
            setSelectedResults(
              produce(selectedResults, (draft) => {
                let targetService = draft.find(
                  (result) => result.serviceId === service.serviceId
                )
                if (!targetService) {
                  targetService = { serviceId: service.serviceId, results: [] }
                  draft.push(targetService)
                }
                const newResult = service.results.find(
                  (result) => result.id === resultId
                )
                if (!newResult) throw new Error(`Result not found: ${resultId}`)
                targetService.results.push(newResult)
              })
            )
          }}
          deselectResult={(resultId) => {
            setSelectedResults(
              produce(selectedResults, (draft) => {
                const targetService = draft.find(
                  (result) => result.serviceId === service.serviceId
                )
                if (!targetService) return
                targetService.results = targetService.results.filter(
                  (result) => result.id !== resultId
                )
              })
            )
          }}
        />
      ))}
    </form>
  )
}

function ResultSet({
  serviceId,
  results,
  selectedResultIds,
  selectResult,
  deselectResult,
}: {
  serviceId: string
  results: searchResult[]
  selectedResultIds: Set<string>
  selectResult: (resultId: string) => void
  deselectResult: (resultId: string) => void
}) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.getAttribute('data-id')
    if (!id) return
    if (e.target.checked) {
      selectResult(id)
    } else {
      deselectResult(id)
    }
  }

  return (
    <fieldset className={styles.resultSet}>
      <legend>{serviceId}</legend>
      <ul className={styles.resultList}>
        {results.map((result) => (
          <li key={result.id}>
            <label>
              <input
                type="checkbox"
                data-id={result.id}
                checked={selectedResultIds.has(result.id)}
                onChange={handleCheckboxChange}
              />
              <div>
                <div className={styles.noWrap}>{result.name}</div>
                <div>
                  {result.school && (
                    <>
                      <span className={styles.noWrap}>{result.school}</span>,{' '}
                    </>
                  )}
                  <span className={styles.noWrap}>{result.city}</span>,{' '}
                  <span className={styles.noWrap}>{result.state}</span>
                </div>
              </div>
              <a
                className={styles.resultLink}
                href={result.url}
                target={`athlete-${serviceId}-${result.id}`}
              >
                <svg
                  className={styles.resultLinkIcon}
                  aria-label="result link"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke="black"
                    strokeWidth={1}
                    d="M5.333 7.997h5.334M10 5.33h1.333a2.667 2.667 0 1 1 0 5.333H10M6 5.33H4.667a2.667 2.667 0 0 0 0 5.333H6"
                  />
                </svg>
              </a>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
