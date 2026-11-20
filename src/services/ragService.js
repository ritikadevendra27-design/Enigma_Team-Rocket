/**
 * ♻️ GreenLoop RAG (Retrieval-Augmented Generation) Service
 * Hackathon: CSI Enigma 5.0 (Team Rocket)
 * 
 * Provides semantic search, context retrieval, and AI answer generation
 * over GreenLoop knowledge base (schema, matching rules, impact metrics,
 * material taxonomy, listings, and buyer demands).
 */

import ragData from '../../rag_knowledge_base.json';

// Simple TF-IDF Vectorizer & Cosine Similarity for Zero-Dependency RAG Retrieval
class LocalVectorRetriever {
  constructor(documents) {
    this.documents = documents;
    this.vocabulary = new Map();
    this.docVectors = [];
    this.idf = new Map();
    this._buildIndex();
  }

  _tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  _buildIndex() {
    const totalDocs = this.documents.length;
    const docTermFreqs = [];

    // Count term frequencies
    this.documents.forEach((doc, docIdx) => {
      const fullText = `${doc.title} ${doc.tags.join(' ')} ${doc.content}`;
      const tokens = this._tokenize(fullText);
      const tf = new Map();

      tokens.forEach((token) => {
        tf.set(token, (tf.get(token) || 0) + 1);
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      });

      docTermFreqs.push({ tf, totalTokens: tokens.length });
    });

    // Compute IDF
    this.vocabulary.forEach((_, term) => {
      let docCount = 0;
      docTermFreqs.forEach(({ tf }) => {
        if (tf.has(term)) docCount++;
      });
      this.idf.set(term, Math.log((1 + totalDocs) / (1 + docCount)) + 1);
    });

    // Compute document vectors
    this.docVectors = docTermFreqs.map(({ tf, totalTokens }) => {
      const vec = new Map();
      let normSq = 0;

      tf.forEach((count, term) => {
        const tfVal = count / (totalTokens || 1);
        const weight = tfVal * (this.idf.get(term) || 1);
        vec.set(term, weight);
        normSq += weight * weight;
      });

      return { vec, norm: Math.sqrt(normSq) || 1 };
    });
  }

  retrieve(query, topK = 3) {
    const queryTokens = this._tokenize(query);
    const queryTf = new Map();

    queryTokens.forEach((token) => {
      queryTf.set(token, (queryTf.get(token) || 0) + 1);
    });

    let qNormSq = 0;
    const qVec = new Map();

    queryTf.forEach((count, term) => {
      if (this.vocabulary.has(term)) {
        const tfVal = count / queryTokens.length;
        const weight = tfVal * (this.idf.get(term) || 1);
        qVec.set(term, weight);
        qNormSq += weight * weight;
      }
    });

    const qNorm = Math.sqrt(qNormSq) || 1;

    // Calculate Cosine Similarity with every document
    const scoredDocs = this.documents.map((doc, idx) => {
      const { vec: dVec, norm: dNorm } = this.docVectors[idx];
      let dotProduct = 0;

      qVec.forEach((weight, term) => {
        if (dVec.has(term)) {
          dotProduct += weight * dVec.get(term);
        }
      });

      // Bonus for keyword matches in title and tags
      const lowerQuery = query.toLowerCase();
      let boost = 0;
      if (doc.title.toLowerCase().includes(lowerQuery)) boost += 0.3;
      doc.tags.forEach((tag) => {
        if (lowerQuery.includes(tag.toLowerCase())) boost += 0.2;
      });

      const similarity = dotProduct / (qNorm * dNorm) + boost;
      return { doc, score: similarity };
    });

    // Sort descending by score
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK).map((item) => item.doc);
  }
}

// Singleton Retriever Instance
const retriever = new LocalVectorRetriever(ragData.documents);

export const ragService = {
  /**
   * Search knowledge base for relevant chunks
   * @param {string} query
   * @param {number} topK
   * @returns {Array<Object>}
   */
  retrieveContext(query, topK = 3) {
    return retriever.retrieve(query, topK);
  },

  /**
   * Generates a grounded response based on retrieved knowledge base context
   * @param {string} userQuery
   * @param {string} [optionalApiKey]
   * @returns {Promise<{ answer: string, sources: Array<Object>, contextUsed: string }>}
   */
  async askQuestion(userQuery, optionalApiKey = null) {
    const relevantDocs = retriever.retrieve(userQuery, 3);
    const contextText = relevantDocs
      .map((doc) => `[Source: ${doc.title} (${doc.category})]\n${doc.content}`)
      .join('\n\n');

    // 1. If an LLM API Key is provided, call external LLM (Gemini / OpenAI)
    if (optionalApiKey || process.env.VITE_GEMINI_API_KEY || process.env.VITE_OPENAI_API_KEY) {
      try {
        const apiKey = optionalApiKey || process.env.VITE_GEMINI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        const prompt = `You are GreenLoop's AI Circular Economy Assistant. Answer the question using ONLY the provided verified context below.\n\nContext:\n${contextText}\n\nQuestion: ${userQuery}\n\nAnswer:`;

        if (apiKey.startsWith('AIza')) {
          // Gemini API call
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return { answer, sources: relevantDocs, contextUsed: contextText };
          }
        }
      } catch (err) {
        console.warn('External LLM call failed, falling back to local extractor:', err);
      }
    }

    // 2. High-precision local grounded response generation
    const matchedFaq = ragData.faq.find((item) =>
      userQuery.toLowerCase().includes(item.question.toLowerCase().slice(0, 15))
    );

    let answer = '';
    if (matchedFaq) {
      answer = matchedFaq.answer;
    } else {
      // Synthesize direct summary from top matching chunk
      const topDoc = relevantDocs[0];
      answer = `Based on the platform specifications for ${topDoc.title}:\n\n${topDoc.content}\n\nFor more details, refer to the verified circular exchange guidelines.`;
    }

    return {
      answer,
      sources: relevantDocs.map((d) => ({ id: d.id, title: d.title, category: d.category })),
      contextUsed: contextText,
    };
  },

  /**
   * Get all raw documents for vector DB ingestion
   */
  getAllDocuments() {
    return ragData.documents;
  },

  /**
   * Get all FAQ entries
   */
  getFaqs() {
    return ragData.faq;
  },
};
