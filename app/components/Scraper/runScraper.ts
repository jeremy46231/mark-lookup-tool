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
    times: athlete.times.map(time => ({
      meet: time.meet,
      date: time.date?.toString(),
      event: time.event,
      timeString: time.timeString,
      // debug: time.sources.map(source => ({
      //   service: source.service,
      //   meters: source.meters,
      //   data: source instanceof MileSplitTime ? source._data : source instanceof AthleticNetTime ? source._data : null,
      //   timeString: source.timeString,
      // })),
    })),
  }

  return data
}

export type passedData = Awaited<ReturnType<typeof runScraper>>