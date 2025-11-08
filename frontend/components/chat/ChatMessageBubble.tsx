import { ChatMessage } from '@/lib/types/chat'
import styles from './ChatMessageBubble.module.css'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.user : styles.agent}`}>
      <div className={styles.messageBubble}>
        <p className={styles.messageContent}>{message.content}</p>
      </div>
    </div>
  )
}

