
import { Ticker, MarketData, Narrative, PromiseRecord, Contradiction, Alert, Watchlist, Message, User, VolumeSpike } from '../types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('auth-error'));
    }
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

// Mock data generators for demo purposes when backend endpoints aren't fully ready
const generateMockMarketData = (): MarketData[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (20 - i) * 15 * 60000).toLocaleTimeString(),
    close: 100 + Math.random() * 10,
    volume: Math.floor(Math.random() * 1000000)
  }));
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    register: async (email: string, password: string, firstName: string, lastName: string) => {
      return fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
    },
    updateProfile: async (data: Partial<User> & { password?: string, avatarUrl?: string }) => {
      return fetchWithAuth('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    requestPasswordReset: async (email: string) => {
      // return fetchWithAuth('/auth/forgot-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ email }),
      // });
      return new Promise(resolve => setTimeout(resolve, 1000)); // Mock success
    },
    logout: () => {
      localStorage.removeItem('auth_token');
    }
  },
  
  watchlist: {
    getAll: async (): Promise<{count: number, watchlists: Watchlist[]}> => {
      return fetchWithAuth('/watchlist');
    },
    getById: async (id: string) => {
      return fetchWithAuth(`/watchlist/${id}`);
    },
    create: async (name: string) => {
      return fetchWithAuth('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
    },
    update: async (id: string, name: string) => {
      return fetchWithAuth(`/watchlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/watchlist/${id}`, {
        method: 'DELETE',
      });
    },
    getItems: async (id: string) => {
      return fetchWithAuth(`/watchlist/${id}/items`);
    },
    addItem: async (watchlistId: string, symbol: string) => {
      return fetchWithAuth(`/watchlist/${watchlistId}/items`, {
        method: 'POST',
        body: JSON.stringify({ symbol }),
      });
    },
    removeItem: async (watchlistId: string, symbol: string) => {
      return fetchWithAuth(`/watchlist/${watchlistId}/items/${symbol}`, {
        method: 'DELETE',
      });
    },
    updateItemSettings: async (watchlistId: string, symbol: string, settings: any) => {
      return fetchWithAuth(`/watchlist/${watchlistId}/items/${symbol}`, {
        method: 'PUT',
        body: JSON.stringify({ alert_settings: settings }),
      });
    }
  },

  analyse: {
    sendMessage: async (message: string, history: Message[] = []) => {
      return fetchWithAuth('/analyse', {
        method: 'POST',
        body: JSON.stringify({ 
          message,
          conversation_history: history 
        }),
      });
    }
  },

  alerts: {
    getRecent: async (): Promise<Alert[]> => {
      try {
        const res = await fetchWithAuth('/alerts?limit=20');
        return res.alerts || [];
      } catch (e) {
        // Fallback mock
        return [
          { id: '1', symbol: 'NVDA', message: 'Volume 4.2x above avg', priority: 'critical', alert_type: 'spike', created_at: new Date().toISOString() }
        ];
      }
    },
    triggerDemoSignal: async () => {
      return {
        id: 'demo-' + Date.now(),
        symbol: 'GME',
        message: 'Sudden localized volatility detected in dark pool routing.',
        priority: 'high',
        alert_type: 'spike',
        created_at: new Date().toISOString()
      };
    },
    dismiss: async (id: string) => {
      // return fetchWithAuth(`/alerts/${id}/dismiss`, { method: 'PUT' });
      return true;
    }
  },

  market: {
    getData: async (symbol: string): Promise<MarketData[]> => {
      return generateMockMarketData();
    },
    getSpikes: async (): Promise<VolumeSpike[]> => {
      try {
        const res = await fetchWithAuth('/volume-spikes');
        return res.spikes || [];
      } catch (e) {
        return [];
      }
    },
    search: async (query: string): Promise<Ticker[]> => {
      // Mock search
      return [
        { id: 1, symbol: query.toUpperCase(), companyName: `${query.toUpperCase()} Corp`, sector: 'Technology' }
      ];
    },
    requestTicker: async (symbol: string): Promise<{success: boolean, message: string}> => {
      // Mock request
      return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Request submitted' }), 500));
      // In real implementation:
      // return fetchWithAuth('/requests/ticker', { method: 'POST', body: JSON.stringify({ symbol }) });
    }
  },

  narratives: {
    getAll: async () => fetchWithAuth('/narratives'),
    getLatest: async (symbol: string) => {
      return {
        id: 1,
        tickerSymbol: symbol,
        summary: 'Focus shifted to AI hardware.',
        managementConfidence: 8,
        toneShift: 'Bullish'
      };
    },
    getPromises: async (symbol: string): Promise<PromiseRecord[]> => {
      return [
        { id: 1, promise_text: 'Release v2 by Q3', promise_date: '2024-01-01', status: 'broken', verification_notes: 'Delayed to 2025' }
      ];
    },
    getContradictions: async (symbol: string): Promise<Contradiction[]> => {
      return [
        {
          id: 1,
          tickerSymbol: symbol,
          contradiction_type: 'guidance_miss',
          explanation: "Management committed to 20% margin but delivered 12%.",
          severity: 'high',
          quote_1: "We are confident in 20% margins.",
          quote_2: "Margins compressed to 12% due to supply chain.",
          detected_at: new Date().toISOString(),
          market_trend_before: 'bullish',
          market_trend_after: 'bearish',
          price_impact: -5.2,
          volume_impact: 1.8,
          gemini_confidence: 0.88,
          is_validated: false,
          news_headline: `${symbol} Misses Margin Targets`
        }
      ];
    }
  },

  system: {
    health: async () => fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`).then(r => r.json()),
  }
};
