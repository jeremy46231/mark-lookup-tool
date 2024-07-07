import { TimesTable } from '@/app/components/TimesTable/TimesTable'
import styles from './DataView.module.css'
import { passedData } from '@/app/components/Scraper/runScraper'
import { Temporal } from 'temporal-polyfill'
import { useMemo } from 'react'

const makeTableData = (data: passedData) =>
  data.times.map((time) => {
    return {
      meet: time.meet ?? undefined,
      date: time.date ? Temporal.PlainDate.from(time.date) : undefined,
      event: time.event ?? undefined,
      meters: time.meters ?? undefined,
      time: time.time
        ? Temporal.Duration.from({
            milliseconds: Math.round(time.time * 1000),
          }).round({
            largestUnit: 'hour',
          })
        : undefined,
    }
  })
export type tableData = ReturnType<typeof makeTableData>[number]

export function DataView({ data }: { data: passedData }) {
  const tableData = useMemo(() => makeTableData(data), [data])

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

      <TimesTable data={tableData} />
    </div>
  )
}
