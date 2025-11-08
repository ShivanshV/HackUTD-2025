'use client'

import { useState } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'
import Header from '@/components/ui/Header'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <ChatInterface />
      </main>
    </div>
  )
}

