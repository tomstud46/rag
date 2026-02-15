
import { KnowledgeDocument, VectorMatch } from '../types';

/**
 * COSINE SIMILARITY ANALOGY:
 * Imagine every document is an arrow pointing in a specific direction in a giant room.
 * The direction is determined by the topics (embeddings).
 * When you ask a question, we create a new arrow for that question.
 * The documents whose arrows point in nearly the same direction as your question
 * are the most relevant ones.
 */

export class VectorStore {
  private documents: KnowledgeDocument[] = [];

  constructor() {
    // Load from local storage for persistence in this demo
    const saved = localStorage.getItem('knowledge_base');
    if (saved) {
      this.documents = JSON.parse(saved);
    }
  }

  addDocument(doc: KnowledgeDocument) {
    this.documents.push(doc);
    this.save();
  }

  deleteDocument(id: string) {
    this.documents = this.documents.filter(d => d.id !== id);
    this.save();
  }

  getDocuments() {
    return this.documents;
  }

  private save() {
    localStorage.setItem('knowledge_base', JSON.stringify(this.documents));
  }

  // Simple dot product for cosine similarity (assuming normalized vectors)
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  search(queryEmbedding: number[], topK: number = 3): VectorMatch[] {
    const matches = this.documents
      .filter(doc => doc.embedding)
      .map(doc => ({
        document: doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return matches;
  }
}

export const vectorStore = new VectorStore();
