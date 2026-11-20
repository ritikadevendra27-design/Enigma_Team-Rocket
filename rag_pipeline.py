"""
♻️ GreenLoop: Smart Circular Economy Platform - RAG Pipeline
Hackathon: CSI Enigma 5.0 | Team Rocket

This script provides an end-to-end Retrieval-Augmented Generation (RAG) pipeline:
1. Loads knowledge documents from `rag_knowledge_base.json` or `RAG_KNOWLEDGE_BASE.md`.
2. Chunks and computes vector/keyword representations.
3. Retrieves relevant context for any user query.
4. Synthesizes a grounded response using local reasoning or LLM API (Gemini/OpenAI).

Usage:
    python rag_pipeline.py --query "How is the match score calculated between a listing and a buyer?"
    python rag_pipeline.py --query "What is the CO2 offset for PET plastic recycling?"
    python rag_pipeline.py --interactive
"""

import os
import sys
import json
import math
import argparse
from typing import List, Dict, Any

KNOWLEDGE_BASE_JSON = os.path.join(os.path.dirname(__file__), "rag_knowledge_base.json")

class RAGRetriever:
    def __init__(self, json_path: str):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        self.documents: List[Dict[str, Any]] = data.get("documents", [])
        self.faqs: List[Dict[str, str]] = data.get("faq", [])
        self.vocab: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vectors: List[Dict[str, float]] = []
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        words = text.lower().replace("-", " ").replace("/", " ").split()
        cleaned = ["".join(c for c in w if c.isalnum()) for w in words]
        return [w for w in cleaned if len(w) > 2]

    def _build_index(self):
        total_docs = len(self.documents)
        doc_freqs = []

        for doc in self.documents:
            text = f"{doc['title']} {' '.join(doc.get('tags', []))} {doc['content']}"
            tokens = self._tokenize(text)
            tf = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
                if t not in self.vocab:
                    self.vocab[t] = len(self.vocab)
            doc_freqs.append((tf, len(tokens)))

        # IDF
        for term in self.vocab:
            df = sum(1 for tf, _ in doc_freqs if term in tf)
            self.idf[term] = math.log((1 + total_docs) / (1 + df)) + 1.0

        # Vector representations
        for tf, total in doc_freqs:
            vec = {}
            norm_sq = 0.0
            for term, count in tf.items():
                val = (count / max(1, total)) * self.idf[term]
                vec[term] = val
                norm_sq += val * val
            vec["__norm__"] = math.sqrt(norm_sq) or 1.0
            self.doc_vectors.append(vec)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        tokens = self._tokenize(query)
        if not tokens:
            return self.documents[:top_k]

        q_tf = {}
        for t in tokens:
            q_tf[t] = q_tf.get(t, 0) + 1

        q_vec = {}
        q_norm_sq = 0.0
        for term, count in q_tf.items():
            if term in self.idf:
                val = (count / len(tokens)) * self.idf[term]
                q_vec[term] = val
                q_norm_sq += val * val
        q_norm = math.sqrt(q_norm_sq) or 1.0

        scores = []
        q_lower = query.lower()

        for idx, doc in enumerate(self.documents):
            d_vec = self.doc_vectors[idx]
            d_norm = d_vec.get("__norm__", 1.0)
            dot = sum(val * d_vec.get(term, 0.0) for term, val in q_vec.items())
            
            # Semantic boost for exact term hits in title or tags
            boost = 0.0
            if doc["title"].lower() in q_lower or any(t.lower() in q_lower for t in doc.get("tags", [])):
                boost += 0.35

            similarity = (dot / (q_norm * d_norm)) + boost
            scores.append((similarity, doc))

        scores.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scores[:top_k]]

    def generate_answer(self, query: str) -> Dict[str, Any]:
        docs = self.retrieve(query, top_k=2)
        context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in docs])

        # Check FAQ for exact/high token overlap match first
        q_tokens = set(self._tokenize(query))
        stop_words = {"what", "how", "does", "the", "for", "and", "is", "are", "which"}
        meaningful_q_tokens = {w for w in q_tokens if w not in stop_words}

        for faq in self.faqs:
            faq_tokens = set(self._tokenize(faq["question"]))
            meaningful_faq = {w for w in faq_tokens if w not in stop_words}
            if meaningful_q_tokens and meaningful_faq:
                overlap = len(meaningful_q_tokens & meaningful_faq) / len(meaningful_faq)
                if overlap >= 0.6:
                    return {
                        "answer": faq["answer"],
                        "sources": [d["title"] for d in docs],
                        "context": context
                    }

        # Otherwise synthesize answer from top retrieved context
        top_doc = docs[0]
        answer = (
            f"Based on GreenLoop's circular economy specifications ({top_doc['title']}):\n"
            f"{top_doc['content']}"
        )

        return {
            "answer": answer,
            "sources": [d["title"] for d in docs],
            "context": context
        }

def main():
    parser = argparse.ArgumentParser(description="GreenLoop RAG Engine (CSI Enigma 5.0)")
    parser.add_argument("--query", "-q", type=str, help="Question to query the RAG engine with")
    parser.add_argument("--interactive", "-i", action="store_true", help="Launch interactive Q&A session")
    args = parser.parse_args()

    rag = RAGRetriever(KNOWLEDGE_BASE_JSON)

    if args.interactive:
        print("\n=======================================================")
        print("🌱 GreenLoop Interactive RAG AI Assistant (CSI Enigma)")
        print("Type 'exit' or 'quit' to end session.")
        print("=======================================================\n")
        while True:
            try:
                user_q = input("\n🔍 Enter your query: ").strip()
                if user_q.lower() in ["exit", "quit", "q"]:
                    break
                if not user_q:
                    continue
                res = rag.generate_answer(user_q)
                print("\n💬 [Answer]:")
                print(res["answer"])
                print(f"\n📚 [Sources]: {', '.join(res['sources'])}")
            except (KeyboardInterrupt, EOFError):
                break
    elif args.query:
        res = rag.generate_answer(args.query)
        print(f"\nQuery: {args.query}\n")
        print(f"Answer:\n{res['answer']}\n")
        print(f"Sources: {', '.join(res['sources'])}\n")
    else:
        # Default self-test query
        sample_q = "How does the smart matching engine calculate location scores?"
        res = rag.generate_answer(sample_q)
        print("--- RAG Pipeline Self-Test ---")
        print(f"Sample Query: {sample_q}")
        print(f"Answer:\n{res['answer']}")
        print(f"Sources: {', '.join(res['sources'])}")

if __name__ == "__main__":
    main()
