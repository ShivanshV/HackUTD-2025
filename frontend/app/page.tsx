'use client'

import { useState } from 'react'
import SearchInterface from '@/components/search/SearchInterface'
import ChatInterface from '@/components/chat/ChatInterface'
import Header from '@/components/ui/Header'
import styles from './page.module.css'

export default function Home() {
  const [showChat, setShowChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string, filters: string[]) => {
    setSearchQuery(query)
    setShowChat(true)
    // Here you would typically trigger the AI search
    console.log('Search query:', query, 'Filters:', filters)
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {!showChat ? (
          <SearchInterface onSearch={handleSearch} />
        ) : (
          <ChatInterface onNewSearch={() => setShowChat(false)} />
        )}
      </main>
    </div>
  )
}

