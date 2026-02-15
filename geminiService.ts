
import { GoogleGenAI } from "@google/genai";
import { vectorStore } from "./vectorStore";

// Initialize the GoogleGenAI client with the required configuration object.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * RAG EXPLANATION:
 * RAG stands for Retrieval-Augmented Generation.
 * 1. Retrieval: Finding relevant info in our "Knowledge Base".
 * 2. Augmented: Adding that info to the prompt.
 * 3. Generation: Letting Gemini write an answer based ONLY on that info.
 */

export const getEmbedding = async (text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_DOCUMENT'): Promise<number[]> => {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{ parts: [{ text }] }],
    });
    
    if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
      return response.embeddings[0].values;
    }
    
    return Array.from({ length: 768 }, () => 0); 
  } catch (error) {
    console.error("Error getting embedding:", error);
    return Array.from({ length: 768 }, () => 0);
  }
};

export interface RAGResponse {
  text: string;
  sources: string[];
}

export interface AudioData {
  data: string;
  mimeType: string;
}

export const chatWithRAG = async (
  query: string, 
  history: any[] = [], 
  audioData?: AudioData
): Promise<RAGResponse> => {
  // 1. Get embedding for user query (using text or a fallback if only audio)
  const embeddingText = query || "Audio query";
  const queryEmbedding = await getEmbedding(embeddingText, 'RETRIEVAL_QUERY');
  
  // 2. Search local vector store
  const matches = vectorStore.search(queryEmbedding, 3);
  const retrievedDocs = matches.map(m => m.document);
  const sources = retrievedDocs.map(d => d.title);

  // 3. Build context string
  const context = retrievedDocs
    .map(d => `Source: ${d.title}\nContent: ${d.content}`)
    .join("\n\n---\n\n");

  // 4. Construct system instruction with retrieved context
  const systemInstruction = `
    You are a helpful AI assistant for "TechCorp". 
    Use the following retrieved context from our knowledge base to answer the user's question.
    If the answer isn't in the context, say you don't know based on the documents provided, but try to be helpful.
    
    KNOWLEDGE BASE CONTEXT:
    ${context || "No specific documents found for this query."}
  `;

  try {
    const userParts: any[] = [];
    if (query) userParts.push({ text: query });
    if (audioData) {
      userParts.push({
        inlineData: {
          data: audioData.data,
          mimeType: audioData.mimeType,
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: userParts }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return { 
      text: response.text || "I'm sorry, I couldn't generate a response.", 
      sources: sources.length > 0 ? sources : [] 
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "I'm sorry, I encountered an error processing your request.", 
      sources: [] 
    };
  }
};
