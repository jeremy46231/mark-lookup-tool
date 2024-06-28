'use server'

import { AthleticNetTime } from '@/scraper/athleticnet'
import { MileSplitTime } from '@/scraper/milesplit'
import { Scraper } from '@/scraper/scraper'

const scraper = new Scraper()

export async function runScraper(query: string) {
  const athlete = await scraper.findAthlete(query)
  const data = {
    name: athlete.fullName,
    pfpUrl: athlete.pfpUrl,
    urls: athlete.urls,
    times: athlete.times.map((time) => ({
      meet: time.meet,
      date: time.date?.toString(),
      event: time.event,
      time: time.timeSeconds,
    })),
  }

  return data
}

export type passedData = Awaited<ReturnType<typeof runScraper>>
