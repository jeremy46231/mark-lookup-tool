'use server'

import { DataView } from '@/app/components/DataView/DataView'
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
    return <h1>Athlete &quot;{athleteId}&quot; not found</h1>
  }
  const data = await getAthlete(athleteData.ids)

  console.log(data)

  return (
    <main>
      <div
        style={{
          margin: '0 auto',
          maxWidth: '65rem',
        }}
      >
        <DataView data={data} />
      </div>
    </main>
  )
}
