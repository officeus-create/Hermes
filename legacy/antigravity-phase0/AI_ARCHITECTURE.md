# Hermes Connect Next — AI Architecture & Multi-Agent Specification

**Version**: 1.0.0  
**Status**: APPROVED AI SPECIFICATION  
**Target Repository**: `hermes-connect-next`

---

## 1. Multi-Agent Router Architecture

Rather than a single monolithic LLM prompt, Hermes Connect Next implements a modular Multi-Agent Architecture coordinated by the **Hermes AI Router**.

```
                        +----------------------+
                        |  Hermes AI Router    |
                        +----------------------+
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
+───────────────────+    +───────────────────+    +───────────────────+
| Business Copilot  |    | Trainer Copilot   |    | Science Agent     |
+───────────────────+    +───────────────────+    +───────────────────+
│ Lead conversion   │    │ Check-in summaries│    │ Exercise physiology│
│ Capacity metrics  │    │ Program drafting  │    │ Evidence tagging  │
│ Revenue input logs│    │ Form analysis     │    │ Nutrition science │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

---

## 2. LLM Provider Independence Layer

All AI agents interface through an abstract provider interface:

```typescript
export interface AIProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  contextData?: Record<string, unknown>;
  temperature?: number;
}

export interface AIProviderResponse {
  content: string;
  structuredOutput?: Record<string, unknown>;
  providerName: 'gemini' | 'openai' | 'mock';
  tokensUsed: number;
}

export interface AIProviderAdapter {
  generateCompletion(request: AIProviderRequest): Promise<AIProviderResponse>;
}
```

This guarantees Hermes Connect Next does not lock itself into a single model vendor (Gemini, OpenAI, or local mock engines).

---

## 3. Specialized AI Employee Specifications

### 1. Trainer Copilot
- **Goal**: Save coaches 5-10 hours/week in client review and workout programming.
- **Capabilities**:
  - Summarizes weekly client check-in data (weight trends, fatigue, sleep quality).
  - Identifies missed workouts and compliance drop-offs.
  - Generates workout plan adjustment drafts (e.g., volume deload, exercise replacement).
- **Safety Rule**: Output is rendered as a *Draft Recommendation Card* requiring trainer manual approval.

### 2. Client Assistant
- **Goal**: Guide clients through daily tasks and workouts.
- **Capabilities**:
  - Answers exercise form questions ("How deep should I squat?").
  - Explores alternatives if equipment is busy ("Gym cable machine taken -> Dumbbell lateral raise").
  - Prompts daily habit completion.

### 3. Science & Research Agent
- **Goal**: Provide peer-reviewed scientific evidence for fitness and nutrition queries.
- **Capabilities**:
  - Queries structured science knowledge base (muscle physiology, metabolism, hypertrophy, recovery).
  - Categorizes evidence into `FACT`, `EVIDENCE`, `HYPOTHESIS`, or `COACHING_PRACTICE`.
  - Cites reputable scientific literature without hallucinating citations.
