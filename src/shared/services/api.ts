
import { Ticker, MarketData, Narrative, PromiseRecord, Contradiction, Alert, Watchlist, Message, User, VolumeSpike } from '../types';
import { SyncService } from './syncService';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Offline Check
  if (!navigator.onLine) {
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
       SyncService.queueRequest(endpoint, options);
    }
    throw new Error('Offline');
  }

  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
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
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      // Propagate as a distinguishable network error
      throw new Error('NetworkError');
    }
    throw error;
  }
}

// Mock Data Store for Fallback Mode with LocalStorage Persistence
const loadMockWatchlists = (): Watchlist[] => {
  try {
    const saved = localStorage.getItem('mock_watchlists');
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

const saveMockWatchlists = (list: Watchlist[]) => {
  localStorage.setItem('mock_watchlists', JSON.stringify(list));
};

let MOCK_WATCHLISTS: Watchlist[] = loadMockWatchlists();

const MOCK_MARKET_DATA: MarketData[] = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (20 - i) * 15 * 60000).toLocaleTimeString(),
  close: 100 + Math.random() * 10,
  volume: Math.floor(Math.random() * 1000000)
}));

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        return await fetchWithAuth('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } catch (e: any) {
        if (e.message === 'NetworkError' || e.message === 'Offline') {
          console.warn("Auth API unreachable, using demo fallback");
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            token: 'demo-fallback-token',
            user: {
              id: 'demo-user-1',
              email: email,
              firstName: 'Demo',
              lastName: 'User'
            }
          };
        }
        throw e;
      }
    },
    register: async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        return await fetchWithAuth('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
      } catch (e: any) {
        if (e.message === 'NetworkError' || e.message === 'Offline') {
          console.warn("Auth API unreachable, using demo fallback");
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            token: 'demo-fallback-token',
            user: {
              id: 'demo-user-1',
              email: email,
              firstName: firstName,
              lastName: lastName
            }
          };
        }
        throw e;
      }
    },
    updateProfile: async (data: Partial<User> & { password?: string, avatarUrl?: string, currentPassword?: string }) => {
      try {
        return await fetchWithAuth('/users/me', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (e: any) {
        if (e.message === 'NetworkError' || e.message === 'Offline') {
          return { success: true };
        }
        throw e;
      }
    },
    deleteAccount: async (password: string) => {
      try {
        return await fetchWithAuth('/users/me', {
          method: 'DELETE',
          body: JSON.stringify({ password })
        });
      } catch (e: any) {
        if (e.message === 'NetworkError' || e.message === 'Offline') {
           return true;
        }
        throw e;
      }
    },
    requestPasswordReset: async (email: string) => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    logout: () => {
      localStorage.removeItem('auth_token');
    }
  },
  
  watchlist: {
    getAll: async (): Promise<{count: number, watchlists: Watchlist[]}> => {
      try {
        return await fetchWithAuth('/watchlist');
      } catch (e) {
        console.warn('API unavailable, utilizing local mock watchlists');
        MOCK_WATCHLISTS = loadMockWatchlists(); // Refresh from storage
        return { count: MOCK_WATCHLISTS.length, watchlists: [...MOCK_WATCHLISTS] };
      }
    },
    getById: async (id: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${id}`);
      } catch (e) {
        const wl = MOCK_WATCHLISTS.find(w => String(w.id) === String(id));
        if (!wl) throw new Error('Not found');
        return wl;
      }
    },
    create: async (name: string) => {
      try {
        return await fetchWithAuth('/watchlist', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });
      } catch (e) {
        const newWl: Watchlist = {
          id: Date.now().toString(),
          name,
          created_at: new Date().toISOString(),
          items: []
        };
        MOCK_WATCHLISTS.push(newWl);
        saveMockWatchlists(MOCK_WATCHLISTS);
        return newWl;
      }
    },
    update: async (id: string, name: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ name }),
        });
      } catch (e) {
        const wl = MOCK_WATCHLISTS.find(w => String(w.id) === String(id));
        if (wl) {
           wl.name = name;
           saveMockWatchlists(MOCK_WATCHLISTS);
        }
        return wl;
      }
    },
    delete: async (id: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        MOCK_WATCHLISTS = MOCK_WATCHLISTS.filter(w => String(w.id) !== String(id));
        saveMockWatchlists(MOCK_WATCHLISTS);
        return true;
      }
    },
    getItems: async (id: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${id}/items`);
      } catch (e) {
        const wl = MOCK_WATCHLISTS.find(w => String(w.id) === String(id));
        return { tickers: wl?.items || [] };
      }
    },
    addItem: async (watchlistId: string, symbol: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${watchlistId}/items`, {
          method: 'POST',
          body: JSON.stringify({ symbol }),
        });
      } catch (e) {
        const wl = MOCK_WATCHLISTS.find(w => String(w.id) === String(watchlistId));
        if (wl) {
          if (!wl.items) wl.items = [];
          if (!wl.items.find(i => i.symbol === symbol)) {
            wl.items.push({
              id: Date.now(),
              symbol,
              companyName: `${symbol} Corp (Mock)`,
              sector: 'Technology'
            });
            saveMockWatchlists(MOCK_WATCHLISTS);
          }
        }
        return true;
      }
    },
    removeItem: async (watchlistId: string, symbol: string) => {
      try {
        return await fetchWithAuth(`/watchlist/${watchlistId}/items/${symbol}`, {
          method: 'DELETE',
        });
      } catch (e) {
        const wl = MOCK_WATCHLISTS.find(w => String(w.id) === String(watchlistId));
        if (wl && wl.items) {
          wl.items = wl.items.filter(i => i.symbol !== symbol);
          saveMockWatchlists(MOCK_WATCHLISTS);
        }
        return true;
      }
    },
    updateItemSettings: async (watchlistId: string, symbol: string, settings: any) => {
      try {
        return await fetchWithAuth(`/watchlist/${watchlistId}/items/${symbol}`, {
          method: 'PUT',
          body: JSON.stringify({ alert_settings: settings }),
        });
      } catch (e) {
        return true;
      }
    }
  },

  analyse: {
    sendMessage: async (message: string, history: Message[] = []) => {
      try {
        return await fetchWithAuth('/analyse', {
          method: 'POST',
          body: JSON.stringify({ 
            message,
            conversation_history: history 
          }),
        });
      } catch (e: any) {
        if (e.message === 'NetworkError' || e.message === 'Offline') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { response: "I'm currently operating in offline mode. I can't access real-time market data or the neural engine right now." };
        }
        throw e;
      }
    }
  },

  alerts: {
    getRecent: async (): Promise<Alert[]> => {
      try {
        const res = await fetchWithAuth('/alerts?limit=20');
        return res.alerts || [];
      } catch (e) {
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
      return true;
    }
  },

  market: {
    getData: async (symbol: string): Promise<MarketData[]> => {
      return MOCK_MARKET_DATA;
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
      return [
        { id: 1, symbol: query.toUpperCase(), companyName: `${query.toUpperCase()} Corp`, sector: 'Technology' }
      ];
    },
    requestTicker: async (symbol: string): Promise<{success: boolean, message: string}> => {
      return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Request submitted' }), 500));
    }
  },

  narratives: {
    getAll: async () => {
      try {
        return await fetchWithAuth('/narratives');
      } catch (e) {
        // Mock fallback if API fails
        return [
           { 
            id: 1, 
            tickerSymbol: 'AAPL', 
            filingType: '10-Q', 
            filedAt: '2025-05-15', 
            summary: 'Focus shifted from hardware margins to ecosystem service growth. Heavy emphasis on AI hardware integration.',
            toneShift: 'Cautiously Bullish',
            managementConfidence: 8,
            keyChanges: ['Infrastructure CapEx +12%', 'R&D allocation for generative AI tripled', 'Supply chain pivot to Southeast Asia']
          }
        ];
      }
    },
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
