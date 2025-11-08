'use client'

import { useState, KeyboardEvent } from 'react'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.inputContainer}>
      <textarea
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Tell me about your needs..."
        disabled={disabled}
        rows={1}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={disabled || !input.trim()}
      >
        Send
      </button>
    </div>
  )
}

