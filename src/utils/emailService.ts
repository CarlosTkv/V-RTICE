
import { apiFetch } from './apiClient';

export const sendWelcomeEmail = async (clientName: string, clientEmail: string) => {
  try {
    const response = await apiFetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, clientEmail }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to trigger email' };
  }
};
