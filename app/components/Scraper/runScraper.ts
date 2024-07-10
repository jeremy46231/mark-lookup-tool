'use server'

import { Athlete, servicesMap } from '@/scraper/scraper'

function getPassedData(athlete: Athlete) {
  const data = {
    name: athlete.fullName,
    pfpUrl: athlete.pfpUrl,
    urls: athlete.urls,
    times: athlete.times.map((time) => ({
      meet: time.meet,
      date: time.date?.toString(),
      event: time.event,
      meters: time.meters,
      time: time.timeSeconds,
    })),
  }

  return data
}
export type passedData = ReturnType<typeof getPassedData>

// export async function runScraper(query: string) {
//   const athlete = await scraper.findAthlete(query)
//   const data = getPassedData(athlete)

//   return data
// }

export async function searchSources(query: string) {
  const results = await Promise.all(
    [...servicesMap.values()].map(async (serviceInfo) => {
      const service = new serviceInfo.constructor()
      const searchResults = await service.search(query)
      return {
        serviceId: service.service,
        searchResults,
        displayName: serviceInfo.displayName,
      }
    })
  )

  return results
}
export type searchResults = Awaited<ReturnType<typeof searchSources>>

export async function getAthlete(ids: [id: string, service: string][]) {
  const sources = await Promise.all(
    ids.map(async ([id, serviceId]) => {
      const serviceInfo = servicesMap.get(serviceId)
      if (!serviceInfo) throw new Error(`Service ${serviceId} not found`)
      const service = new serviceInfo.constructor()
      const source = await service.getAthlete(id)
      return source
    })
  )
  const athlete = new Athlete(sources)
  await athlete.load()
  const data = getPassedData(athlete)
  return data
}
