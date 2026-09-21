import { CustomerConversation, CustomerMessage } from '@/types';

// Bandeja inicial limpia para recibir exclusivamente mensajes reales de @migaliab vía Webhook
export const INITIAL_CONVERSATIONS: CustomerConversation[] = [];

export const INITIAL_MESSAGES: Record<string, CustomerMessage[]> = {};
