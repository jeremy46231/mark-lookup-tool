import { getAthlete } from '@/app/components/Scraper/runScraper'
import { athletes } from '@/data/data'

export default async function AthletePage({
  params: { athleteId },
}: {
  params: {
    athleteId: string
  }
}) {
  const athleteData = athletes.get(athleteId)
  if (!athleteData) {
    return <h1>Athlete "{athleteId}" not found</h1>
  }
  const data = await getAthlete(athleteData.ids)

  return (
    <div>
      <h1>Athlete {athleteId}</h1>
    </div>
  )
}