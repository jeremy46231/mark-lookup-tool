import { produce } from 'immer'
import type { searchResults } from '@/app/components/Scraper/runScraper'
import type { searchResult } from '@/scraper/service'
import styles from './SearchResults.module.css'
// import { useState } from 'react'

export type selectedResults = {
  serviceId: string
  results: searchResult[]
}[]

type resultSetData = {
  serviceId: string
  selectedResults: searchResult[]
  searchOnlyResults: searchResult[]
}

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

  const displayedResults: resultSetData[] = [...serviceIds].map((serviceId) => {
    const thisSearchResults =
      searchResults.find((service) => service.serviceId === serviceId)
        ?.searchResults ?? []
    const thisSelectedResults =
      selectedResults.find((result) => result.serviceId === serviceId)
        ?.results ?? []

    const searchOnlyResults = thisSearchResults.filter(
      (result) =>
        !thisSelectedResults.some((otherResult) => result.id === otherResult.id)
    )
    return {
      serviceId,
      selectedResults: thisSelectedResults,
      searchOnlyResults,
    }
  })

  return (
    <form className={styles.results}>
      {displayedResults.map((service) => (
        <ResultSet
          key={service.serviceId}
          data={service}
          selectResult={(result) => {
            setSelectedResults(
              produce(selectedResults, (draft) => {
                let targetService = draft.find(
                  (s) => s.serviceId === service.serviceId
                )
                if (!targetService) {
                  targetService = { serviceId: service.serviceId, results: [] }
                  draft.push(targetService)
                }
                if (targetService.results.some((r) => r.id === result.id))
                  return
                targetService.results.push(result)
              })
            )
          }}
          deselectResult={(result) => {
            setSelectedResults(
              produce(selectedResults, (draft) => {
                const targetService = draft.find(
                  (r) => r.serviceId === service.serviceId
                )
                if (!targetService) return
                targetService.results = targetService.results.filter(
                  (r) => r.id !== result.id
                )
                if (targetService.results.length === 0) {
                  draft.splice(
                    draft.findIndex(
                      (result) => result.serviceId === service.serviceId
                    ),
                    1
                  )
                }
              })
            )
          }}
        />
      ))}
    </form>
  )
}

function ResultSet({
  data: { serviceId, selectedResults, searchOnlyResults },
  selectResult,
  deselectResult,
}: {
  data: resultSetData
  selectResult: (result: searchResult) => void
  deselectResult: (result: searchResult) => void
}) {
  return (
    <fieldset className={styles.resultSet}>
      <legend>{serviceId}</legend>
      <ResultList
        results={selectedResults}
        serviceId={serviceId}
        checked={true}
        selectResult={selectResult}
        deselectResult={deselectResult}
      />
      <details className={styles.resultDetails}>
        <summary>Search results</summary>
        <ResultList
          results={searchOnlyResults}
          serviceId={serviceId}
          checked={false}
          selectResult={selectResult}
          deselectResult={deselectResult}
        />
      </details>
    </fieldset>
  )
}

function ResultList({
  results,
  serviceId,
  checked,
  selectResult,
  deselectResult,
}: {
  results: searchResult[]
  serviceId: string
  checked: boolean
  selectResult: (result: searchResult) => void
  deselectResult: (result: searchResult) => void
}) {
  return (
    <ul className={styles.resultList}>
      {results.map((result) => (
        <Result
          key={result.id}
          result={result}
          serviceId={serviceId}
          checked={checked}
          selectResult={selectResult}
          deselectResult={deselectResult}
        />
      ))}
    </ul>
  )
}

function Result({
  result,
  serviceId,
  checked,
  selectResult,
  deselectResult,
}: {
  result: searchResult
  serviceId: string
  checked: boolean
  selectResult: (result: searchResult) => void
  deselectResult: (result: searchResult) => void
}) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectResult(result)
    } else {
      deselectResult(result)
    }
  }

  return (
    <li key={result.id}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
        />
        <div>
          <div>{result.name}</div>
          <div>
            {result.school && <>{result.school}, </>}
            {result.city}, {result.state}
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
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="#999"
              strokeWidth={1}
              d="
                M10,4.5 H4.5 v15 h15 V14
                M13,4.5 h6.5 V11
              "
            />
            <path
              stroke="#aaa"
              strokeWidth={1.25}
              d="
                M19.5,4.5 L10,14
              "
            />
          </svg>
        </a>
      </label>
    </li>
  )
}
