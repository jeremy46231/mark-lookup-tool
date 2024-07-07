import type { searchResults } from '@/app/components/Scraper/runScraper'
import styles from './SearchResults.module.css'

export function SearchResults({ results }: { results: searchResults }) {
  return (
    <form className={styles.results}>
      {results.map((service) => (
        <fieldset key={service.serviceId} className={styles.resultSet}>
          <legend>{service.displayName}</legend>
          <ul className={styles.resultList}>
            {service.searchResults.map((result) => (
              <li key={result.id}>
                <label>
                  <input type="checkbox" />
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
                      aria-label="profile link"
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
      ))}
    </form>
  )
}
