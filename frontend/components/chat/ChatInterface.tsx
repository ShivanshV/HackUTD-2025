'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '@/lib/types/chat'
import { sendChatMessage } from '@/lib/api/chat'
import ChatMessageBubble from './ChatMessageBubble'
import ChatInput from './ChatInput'
import CarSuggestions from './CarSuggestions'
import CarDetailsView from './CarDetailsView'
import styles from './ChatInterface.module.css'

interface ChatInterfaceProps {
  onNewSearch?: () => void;
}

export default function ChatInterface({ onNewSearch }: ChatInterfaceProps = {}) {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'agent',
      content: "Hi! I'm your Toyota AI assistant. Tell me about your daily commute, family size, or what features matter most to you!",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [zipCode, setZipCode] = useState('75080')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    const updatedHistory = [...chatHistory, userMessage]
    setChatHistory(updatedHistory)
    setIsLoading(true)

    try {
      // Send entire chat history to backend
      const agentResponse = await sendChatMessage(updatedHistory)

      // Add agent response to chat history
      const agentMessage: ChatMessage = {
        role: 'agent',
        content: agentResponse,
        timestamp: new Date(),
      }

      setChatHistory([...updatedHistory, agentMessage])
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      }
      setChatHistory([...updatedHistory, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickSuggestions = [
    'Electric cars under $50k',
    'Compact SUVs with high safety ratings',
    'Luxury sedans with leather interiors'
  ]

  // Sample car data with full details
  const sampleCarDetails = {
    id: 'rav4-hybrid-xle-2025',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    trim: 'XLE',
    year: 2025,
    image: '/cars/camry-2024.jpg',
    specs: {
      body_style: 'SUV',
      size_class: 'compact_suv',
      pricing: {
        base_msrp: 33000,
        msrp_range: [33000, 36000],
        est_lease_monthly: 380,
        est_loan_monthly: 420
      },
      powertrain: {
        fuel_type: 'hybrid',
        drivetrain: 'AWD',
        mpg_city: 41,
        mpg_hwy: 38,
        mpg_combined: 40,
        est_range_miles: 580
      },
      capacity: {
        seats: 5,
        rear_seat_child_seat_fit: 'good',
        isofix_latch_points: true,
        cargo_volume_l: 1067,
        fold_flat_rear_seats: true
      },
      dimensions: {
        length_mm: 4600,
        width_mm: 1855,
        height_mm: 1685,
        turning_radius_m: 5.5
      },
      comfort: {
        ride_comfort_score: 0.8,
        noise_level_score: 0.7
      },
      parking_tags: {
        city_friendly: true,
        tight_space_ok: false
      },
      environment_fit: {
        ground_clearance_in: 8.1,
        offroad_capable: false,
        rough_road_score: 0.8,
        snow_rain_score: 0.85
      },
      safety: {
        has_tss: true,
        airbags: 8,
        driver_assist: [
          'lane_keep_assist',
          'adaptive_cruise_control',
          'blind_spot_monitor'
        ],
        crash_test_score: 0.95
      }
    },
    derived_scores: {
      eco_score: 0.85,
      family_friendly_score: 0.9,
      city_commute_score: 0.75,
      road_trip_score: 0.9
    }
  };

  if (selectedCarId) {
    return (
      <CarDetailsView 
        car={sampleCarDetails} 
        onBack={() => setSelectedCarId(null)}
        userPreferences={{
          hasFamily: true,
          longCommute: true,
          ecoConscious: true,
          cityDriver: false
        }}
      />
    );
  }

  return (
    <div className={styles.chatLayout}>
      {/* Chat Area - 60% */}
      <div className={styles.chatSection}>
        <div className={styles.chatHeader}>
          <button className={styles.newSearchBtn} onClick={onNewSearch}>
            <span className={styles.backArrow}>←</span> New search
          </button>
          <div className={styles.zipCode}>
            <span className={styles.locationIcon}>📍</span>
            <span>{zipCode}</span>
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {chatHistory.map((message, index) => (
              <div key={index}>
                <ChatMessageBubble message={message} />
                {/* Show suggestions after agent messages */}
                {message.role === 'agent' && index === chatHistory.length - 1 && !isLoading && (
                  <div className={styles.suggestions}>
                    <p className={styles.suggestionDisclaimer}>
                      Our AI can make mistakes. Check important info. Do not include personal or sensitive information.
                    </p>
                    <div className={styles.suggestionChips}>
                      {quickSuggestions.map((suggestion, i) => (
                        <button 
                          key={i} 
                          className={styles.suggestionChip}
                          onClick={() => handleSendMessage(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className={styles.loadingIndicator}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>

      {/* Suggestions Sidebar - 40% */}
      <div className={styles.suggestionsSection}>
        <CarSuggestions onViewDetails={(carId) => setSelectedCarId(carId)} />
      </div>
    </div>
  )
}

