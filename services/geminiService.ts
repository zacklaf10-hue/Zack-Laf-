import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialInsight } from '../types';

// Helper to get key from various sources
export const getApiKey = () => {
  // 1. Vite Environment Variables (Netlify - MUST start with VITE_)
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // 2. Local Storage (User entered in UI - Fallback)
  if (typeof localStorage !== "undefined") {
    const localKey = localStorage.getItem('zfinance_api_key');
    if (localKey) return localKey;
  }
  
  return "";
};

export const hasSharedKey = (): boolean => {
    // @ts-ignore
    return !!(typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_KEY);
}

export const getFinancialInsights = async (transactions: Transaction[]): Promise<FinancialInsight> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      title: "AI Not Configured",
      content: "System API Key missing. Please check Netlify settings (VITE_API_KEY).",
      tone: "neutral"
    };
  }

  try {
    // Initialize instance dynamically to use the latest key
    const ai = new GoogleGenAI({ apiKey });

    const recentTransactions = transactions.slice(0, 20); // Analyze last 20 for brevity
    const transactionSummary = JSON.stringify(recentTransactions.map(t => ({
      amount: t.amount,
      type: t.type,
      category: t.category,
      merchant: t.merchantName,
      date: t.date.split('T')[0]
    })));

    const prompt = `
      You are a witty and helpful French financial advisor. 
      Analyze the following recent transactions JSON: ${transactionSummary}
      
      Provide a single, short, impactful insight or piece of advice (max 2 sentences). 
      Also determine if the tone is 'positive' (saving well), 'warning' (spending too much), or 'neutral'.
      
      Return JSON format: { "title": "Catchy Title", "content": "The advice text.", "tone": "positive" | "warning" | "neutral" }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tone: { type: Type.STRING, enum: ['positive', 'warning', 'neutral'] }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FinancialInsight;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Service Unavailable",
      content: "Could not generate insights at this moment. Please try again later.",
      tone: "neutral"
    };
  }
};


export const predictCategory = async (merchantName: string, amount: number): Promise<string | null> => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Classify this expense for a merchant named "${merchantName}" with amount ${amount} EUR. 
        Choose one category from this list: Groceries, Transport, Utilities, Shopping, Restaurant, Entertainment, Health, Housing, Other. 
        Return ONLY the category name string.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text?.trim();
        return text || null;
    } catch (e) {
        return null;
    }
}