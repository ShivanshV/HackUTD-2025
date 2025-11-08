import axios from 'axios';
import { ChatMessage, ChatRequest, ChatResponse } from '@/lib/types/chat';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Send chat message to backend
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      messages,
    } as ChatRequest);
    
    return response.data.content;
  } catch (error) {
    console.error('Error sending chat message:', error);
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

