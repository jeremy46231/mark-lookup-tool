import type { searchResults } from '@/app/components/Scraper/runScraper'
import type { searchResult } from '@/scraper/service'
import styles from './SearchResults.module.css'
import { useState } from 'react'

type serviceResults = searchResults[number]

export type selectedResults = {
  serviceId: string
  results: searchResult[]
}[]

export function SearchResults({
  results,
  selectedResults,
  setSelectedResults,
}: {
  results: searchResults
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

  return (
    <form className={styles.results}>
      {results.map((service) => (
        <ResultSet
          key={service.serviceId}
          service={service}
          selectedOptions={
            selectedResults.find(
              (result) => result.serviceId === service.serviceId
            )!.results
          }
          setSelectedOptions={(results) =>
            setSelectedResults(
              selectedResults.map((result) =>
                result.serviceId === service.serviceId
                  ? { ...result, results }
                  : result
              )
            )
          }
        />
      ))}
    </form>
  )
}

function ResultSet({
  service,
  selectedOptions,
  setSelectedOptions,
}: {
  service: serviceResults
  selectedOptions: searchResult[]
  setSelectedOptions: (results: searchResult[]) => void
}) {

  const checkedIds = new Set(selectedOptions.map((result) => result.id))
  const selectedOnly = selectedOptions.filter(
    (result) => !service.searchResults.some((result) => result.id === result.id)
  )
  const allResults = [...selectedOnly, ...service.searchResults]

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.getAttribute('data-id')
    if (!id) return
    if (e.target.checked) {
      console.log('checked', id)
      setSelectedOptions([
        ...selectedOptions,
        service.searchResults.find((result) => result.id === id)!,
      ])
    } else {
      console.log('unchecked', id)
      setSelectedOptions(selectedOptions.filter((result) => result.id !== id))
    }
  }

  return (
    <fieldset key={service.serviceId} className={styles.resultSet}>
      <legend>{service.displayName}</legend>
      <ul className={styles.resultList}>
        {allResults.map((result) => (
          <li key={result.id}>
            <label>
              <input
                type="checkbox"
                data-id={result.id}
                checked={checkedIds.has(result.id)}
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
                target={`athlete-${service.serviceId}-${result.id}`}
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
