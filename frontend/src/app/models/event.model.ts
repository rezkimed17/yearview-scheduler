export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  color: string;
  recurring?: {
    enabled: boolean;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
  isRecurringInstance?: boolean;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  color: string;
  recurring?: {
    enabled: boolean;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
} 