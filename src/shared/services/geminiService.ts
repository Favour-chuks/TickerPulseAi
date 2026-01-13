
import { GoogleGenAI, Type } from "@google/genai";
import { Narrative, Contradiction, VolumeSpike } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeFilingNarrative = async (ticker: string, filingContent: string): Promise<Partial<Narrative>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this SEC filing for ${ticker}: ${filingContent}. Extract a summary, key changes, and tone analysis.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          toneShift: { type: Type.STRING },
          managementConfidence: { type: Type.INTEGER, description: "1-10 scale" },
          keyChanges: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['summary', 'toneShift', 'managementConfidence', 'keyChanges']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateDivergenceHypothesis = async (spike: Partial<VolumeSpike>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `A volume spike of ${spike.deviationMultiple}x moving average was detected for ${spike.tickerSymbol} at price ${spike.priceAtSpike}. No major news was found. Generate a professional market hypothesis for this divergence.`,
    config: {
      systemInstruction: "You are a senior market analyst specializing in unusual options activity and dark pool flows."
    }
  });

  return response.text || "Insufficient data for hypothesis.";
};

export const detectContradictions = async (ticker: string, s1: string, s2: string): Promise<Partial<Contradiction> | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compare these two statements from ${ticker} and identify if they contradict each other or represent a significant pivot. 
    Statement 1: ${s1}
    Statement 2: ${s2}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasContradiction: { type: Type.BOOLEAN },
          type: { type: Type.STRING },
          explanation: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] }
        },
        required: ['hasContradiction', 'type', 'explanation', 'severity']
      }
    }
  });

  const res = JSON.parse(response.text || '{}');
  return res.hasContradiction ? res : null;
};

export const generateCreativeImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image data found in the response.");
};

export const chatWithAura = async (message: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: "You are Aura, an AI assistant for SignalHub. Help analysts detect narrative divergences and understand unusual market movements. Be concise, professional, and slightly cynical about corporate filings.",
    },
  });

  return response.text || "Aura is currently unavailable.";
};
