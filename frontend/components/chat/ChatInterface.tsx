'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMessage, Vehicle } from '@/lib/types/chat'
import { sendChatMessage } from '@/lib/api/chat'
import { getVehicleById } from '@/lib/api/vehicles'
import ChatMessageBubble from './ChatMessageBubble'
import ChatInput from './ChatInput'
import CarSuggestions from './CarSuggestions'
import CarDetailsView from './CarDetailsView'
import styles from './ChatInterface.module.css'

interface ChatInterfaceProps {
  onNewSearch?: () => void;
  initialQuery?: string;
}

const STORAGE_KEY = 'toyota_chat_session';

interface StoredChatSession {
  chatHistory: ChatMessage[];
  recommendedCarIds: string[];
  zipCode: string;
  hasInitialized: boolean;
}

export default function ChatInterface({ onNewSearch, initialQuery }: ChatInterfaceProps = {}) {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [loadingCarDetails, setLoadingCarDetails] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [recommendedCars, setRecommendedCars] = useState<Vehicle[]>([])
  const [recommendedCarIds, setRecommendedCarIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [zipCode, setZipCode] = useState('75080')
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isRestored, setIsRestored] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatHistoryRef = useRef<ChatMessage[]>([])
  
  // Restore chat session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: StoredChatSession = JSON.parse(stored);
        
        // Restore chat history (convert timestamp strings back to Date objects)
        if (session.chatHistory && session.chatHistory.length > 0) {
          const restoredHistory = session.chatHistory.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          setChatHistory(restoredHistory);
          chatHistoryRef.current = restoredHistory;
          console.log('✅ Restored chat history from session:', restoredHistory.length, 'messages');
        }
        
        // Restore recommended car IDs
        if (session.recommendedCarIds && session.recommendedCarIds.length > 0) {
          setRecommendedCarIds(session.recommendedCarIds);
          // Fetch car details for recommended IDs
          const carPromises = session.recommendedCarIds.map(id => 
            getVehicleById(id).catch(err => {
              console.error(`Failed to fetch car ${id}:`, err)
              return null
            })
          );
          Promise.all(carPromises).then(cars => {
            const validCars = cars.filter((car): car is Vehicle => car !== null);
            setRecommendedCars(validCars);
            console.log('✅ Restored recommended cars:', validCars.length);
          });
        }
        
        // Restore zip code
        if (session.zipCode) {
          setZipCode(session.zipCode);
        }
        
        // Restore initialization state
        if (session.hasInitialized) {
          setHasInitialized(true);
        }
        
        setIsRestored(true);
      } else {
        setIsRestored(true);
      }
    } catch (error) {
      console.error('Failed to restore chat session:', error);
      setIsRestored(true);
    }
  }, []);

  // Save chat session to sessionStorage whenever it changes
  useEffect(() => {
    if (isRestored) {
      try {
        const session: StoredChatSession = {
          chatHistory,
          recommendedCarIds,
          zipCode,
          hasInitialized
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        console.log('💾 Saved chat session to storage');
      } catch (error) {
        console.error('Failed to save chat session:', error);
      }
    }
  }, [chatHistory, recommendedCarIds, zipCode, hasInitialized, isRestored]);

  // Clear session storage when user clicks "New search"
  const handleNewSearch = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      // Clear the reload check flag so reload detection can run again if needed
      sessionStorage.removeItem('toyota_reload_checked_v2');
      // Clear suggested.json when user explicitly starts a new search
      import('@/lib/api/vehicles').then(({ clearSuggestedVehicles }) => {
        clearSuggestedVehicles().catch(console.error);
      });
      console.log('🗑️ Cleared chat session and suggested.json (user clicked "New search")');
    } catch (error) {
      console.error('Failed to clear chat session:', error);
    }
    if (onNewSearch) {
      onNewSearch();
    }
  };
  
  // Keep ref in sync with state
  useEffect(() => {
    chatHistoryRef.current = chatHistory
  }, [chatHistory])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])


  // Fetch car details when a car is selected
  useEffect(() => {
    if (selectedCarId) {
      setLoadingCarDetails(true);
      getVehicleById(selectedCarId)
        .then(vehicle => {
          setSelectedCar(vehicle);
        })
        .catch(err => {
          console.error('Failed to load vehicle details:', err);
          alert('Failed to load vehicle details. Please try again.');
          setSelectedCarId(null);
        })
        .finally(() => {
          setLoadingCarDetails(false);
        });
    }
  }, [selectedCarId]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message to chat history immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }

    // Get the latest chat history from ref (always up-to-date)
    const currentHistory = chatHistoryRef.current
    const updatedHistory = [...currentHistory, userMessage]
    
    // Update state immediately so user message appears in UI
    setChatHistory(updatedHistory)
    setIsLoading(true)

    try {
      // Send entire chat history to backend (including the new user message)
      // This ensures the agent sees all previous messages plus the new one
      console.log('Sending chat message with history length:', updatedHistory.length)
      const response = await sendChatMessage(updatedHistory)

      // Validate response
      if (!response || !response.content) {
        console.error('Invalid response from backend:', response)
        throw new Error('Invalid response from backend')
      }

      // Add agent response to chat history
      const agentMessage: ChatMessage = {
        role: 'agent',
        content: response.content,
        timestamp: new Date(),
      }

      setChatHistory(prevHistory => [...prevHistory, agentMessage])

      // Handle recommended car IDs
      if (response.recommended_car_ids && response.recommended_car_ids.length > 0) {
        console.log('Received recommended car IDs:', response.recommended_car_ids)
        setRecommendedCarIds(response.recommended_car_ids)
        // Fetch car details for recommended IDs
        const carPromises = response.recommended_car_ids.map(id => 
          getVehicleById(id).catch(err => {
            console.error(`Failed to fetch car ${id}:`, err)
            return null
          })
        )
        const cars = await Promise.all(carPromises)
        const validCars = cars.filter((car): car is Vehicle => car !== null)
        console.log('Fetched valid cars:', validCars.length)
        setRecommendedCars(validCars)
      } else {
        console.log('No recommended car IDs in response')
        // Clear recommendations if none provided
        setRecommendedCarIds([])
        setRecommendedCars([])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message with more details
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: `I'm sorry, I'm having trouble connecting right now. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      }
      setChatHistory(prevHistory => [...prevHistory, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // Send initial query when component mounts (only if not restored from storage and no existing history)
  useEffect(() => {
    // Only send initial query if:
    // 1. Session has been restored (so we know if there's stored data)
    // 2. There's an initial query provided
    // 3. We haven't initialized yet
    // 4. There's no existing chat history (either restored or new)
    if (isRestored && initialQuery && !hasInitialized && chatHistory.length === 0) {
      console.log('📤 Sending initial query:', initialQuery);
      setHasInitialized(true);
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, hasInitialized, isRestored, chatHistory.length, handleSendMessage])

  const quickSuggestions = [
    'Electric cars under $50k',
    'Compact SUVs with high safety ratings',
    'Luxury sedans with leather interiors'
  ]

  // Show loading state while fetching car details
  if (loadingCarDetails) {
    return (
      <div className={styles.chatLayout}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Show car details if a car is selected and loaded
  if (selectedCarId && selectedCar) {
    return (
      <CarDetailsView 
        car={selectedCar} 
        onBack={() => {
          setSelectedCarId(null);
          setSelectedCar(null);
        }}
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
          <button className={styles.newSearchBtn} onClick={handleNewSearch}>
            <span className={styles.backArrow}>←</span> New search
          </button>
          <div className={styles.zipCode}>
            <span className={styles.locationIcon}>📍</span>
            <span>{zipCode}</span>
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {chatHistory.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <>
                {chatHistory.map((message, index) => {
                  const messageKey = `msg-${index}-${message.role}-${message.timestamp?.getTime() || index}`;
                  console.log('🎨 Rendering message:', messageKey, message.role, message.content.substring(0, 50));
                  return (
                    <div key={messageKey} style={{ marginBottom: '1rem' }}>
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
                  );
                })}
              </>
            )}
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
        <CarSuggestions 
          cars={recommendedCars.length > 0 ? recommendedCars : undefined}
          onViewDetails={(carId) => setSelectedCarId(carId)}
          recommendedCarIds={recommendedCarIds}
        />
      </div>
    </div>
  )
}

