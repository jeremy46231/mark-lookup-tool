import Image from 'next/image'
import styles from './page.module.css'
import { Scraper } from '@/app/components/Scraper/Scraper'

export default function Home() {
  return <main className={styles.main}>
    <Scraper />
  </main>
}
