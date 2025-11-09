import axios from 'axios';
import { ChatMessage, ChatRequest, ChatResponse } from '@/lib/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Send chat message to backend
export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      messages,
    } as ChatRequest);
    
    // Log response for debugging
    console.log('Chat API Response:', {
      content: response.data.content?.substring(0, 100),
      hasRecommendedIds: !!response.data.recommended_car_ids,
      recommendedCount: response.data.recommended_car_ids?.length || 0,
      scoringMethod: response.data.scoring_method
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw new Error('Failed to get response from AI assistant');
  }
}

// Health check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

