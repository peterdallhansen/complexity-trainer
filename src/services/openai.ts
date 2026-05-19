/**
 * Azure OpenAI service for generating time complexity questions.
 *
 * Uses the Azure OpenAI REST API to generate questions in two formats:
 * 1. Algorithm complexity analysis (pseudocode → Big-O)
 * 2. True/false asymptotic notation statements
 *
 * Questions are returned as structured JSON for deterministic parsing.
 */

import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { AlgorithmQuestion, TrueFalseQuestion, Question } from "../types/questions";

/** Azure OpenAI configuration loaded from environment variables. */
const AZURE_CONFIG = {
  baseUrl: import.meta.env.VITE_AZURE_OPENAI_BASE_URL as string,
  apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY as string,
  model: import.meta.env.VITE_AZURE_OPENAI_MODEL as string,
};

/**
 * System prompt establishing the LLM's role as an algorithm complexity expert.
 * Ensures consistent, exam-quality question generation.
 */
const SYSTEM_PROMPT = `You are an expert algorithms professor at DTU (Technical University of Denmark) creating exam questions about time complexity and asymptotic analysis.

Your questions must be:
- Rigorous and mathematically correct
- At the difficulty level of a university algorithms course
- Varied in the patterns they test (loops, nested loops, while-doubling, recursion, Master Theorem, etc.)
- Using proper pseudocode conventions (for, while, if/else, return, floor/ceiling notation)

IMPORTANT: Always return valid JSON matching the exact schema requested. Never include markdown formatting or code fences in your response.`;

/**
 * Prompt template for generating algorithm complexity questions (Type 1).
 * Includes few-shot examples from actual DTU exam questions.
 */
const ALGORITHM_PROMPT = `Generate 5 unique algorithm complexity analysis questions. Each question shows ONE pseudocode algorithm, and the student must identify its tightest Big-O running time.

Use varied algorithm patterns across the 5 questions:
- Simple/nested for-loops with polynomial bounds
- While-loops with doubling (k = 2*k) or halving (k = k/2) — logarithmic patterns
- Loops bounded by sqrt(n), floor(sqrt(n)), ceiling(log n)
- Recursive algorithms (use recurrence relations / Master Theorem)
- Mixed patterns: a for-loop containing a while-loop with doubling

Each algorithm should have a clear, unambiguous tightest Big-O bound from this list:
O(1), O(\\log n), O(\\sqrt{n}), O(n), O(n \\log n), O(n^2), O(n^2 \\log n), O(n^3), O(2^n)

Respond with a JSON object with this exact structure:
{
  "questions": [
    {
      "type": "algorithm",
      "name": "ALG1",
      "pseudocode": ["ALG1(n)", "  t = 0", "  for i = 1 to n do", "    for j = 1 to n do", "      t = t + 1", "    end for", "  end for"],
      "parameter": "n",
      "correctAnswer": "O(n^2)",
      "explanation": "Two nested for-loops each running n times gives n × n = n² iterations."
    }
  ]
}

RULES for pseudocode formatting:
- First line is always the function signature like "ALG1(n)"
- Use 2-space indentation for nesting
- Use "for i = 1 to X do" / "end for" syntax
- Use "while CONDITION do" / "end while" syntax
- Use "if CONDITION then" / "else" / "end if" syntax
- Use floor(sqrt(n)) written as "⌊√n⌋", ceiling as "⌈log n⌉"
- Keep algorithms concise: 4-10 lines of pseudocode

correctAnswer MUST be exactly one of: "O(1)", "O(\\\\log n)", "O(\\\\sqrt{n})", "O(n)", "O(n \\\\log n)", "O(n^2)", "O(n^2 \\\\log n)", "O(n^3)", "O(2^n)"`;

/**
 * Prompt template for generating true/false asymptotic statements (Type 2).
 * Includes examples spanning O, Θ, and Ω notations.
 */
const TRUE_FALSE_PROMPT = `Generate 5 unique true/false questions about asymptotic notation. Each question is a mathematical statement using O (big-O), Θ (big-Theta), or Ω (big-Omega) notation, and the student must determine if it is correct.

Mix of correct and incorrect statements (aim for roughly 50/50).

Use varied expression patterns:
- Polynomial expressions: n^3 + 5n^2 + n = Θ(n^3)
- Logarithmic expressions: log(n^2) + 2·log(n^4) = Θ(log n)
- Mixed polynomial-log: 32n^5·log^3(n) + 0.1·n + 2n^2·log(n) = O(n^5)
- Roots and fractional exponents: √n·(n + n^{3/2}) = Θ(n^2)
- Exponential expressions: (1.5)^n + 4^{log n} = Ω(n^8)
- Expressions with n/log(n) terms: 3·log(n) + n/log(n) + 2n = Ω(n/log n)

The LaTeX should be well-formatted and use standard notation:
- Use \\log for logarithms
- Use \\sqrt{} for square roots  
- Use \\Theta, \\Omega for Greek letters
- Use \\cdot for multiplication
- Use \\frac{}{} for fractions

Respond with a JSON object with this exact structure:
{
  "questions": [
    {
      "type": "trueFalse",
      "latex": "n^3 + 5n^2 + n = \\\\Theta(n^2)",
      "isCorrect": false,
      "explanation": "The dominant term is n^3, so the expression is \\\\Theta(n^3), not \\\\Theta(n^2)."
    }
  ]
}

IMPORTANT: 
- Make sure the LaTeX is valid and renders correctly. Double-escape backslashes for JSON (e.g., \\\\Theta, \\\\log, \\\\sqrt{}).
- The explanation must be a final, definitive derivation. DO NOT output stream-of-consciousness or self-corrections like "Wait...". Work out the correct answer internally, then output a confident explanation.`;

const llm = new ChatOpenAI({
  apiKey: AZURE_CONFIG.apiKey,
  model: AZURE_CONFIG.model,
  temperature: 0.9,
  maxTokens: 4096,
  configuration: {
    baseURL: AZURE_CONFIG.baseUrl,
    defaultHeaders: {
      "api-key": AZURE_CONFIG.apiKey,
    },
  },
});

const algorithmQuestionSchema = z.object({
  type: z.literal("algorithm"),
  name: z.string(),
  parameter: z.string(),
  pseudocode: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const trueFalseQuestionSchema = z.object({
  type: z.literal("trueFalse"),
  latex: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string(),
});

const algorithmBatchSchema = z.object({
  questions: z.array(algorithmQuestionSchema),
});

const trueFalseBatchSchema = z.object({
  questions: z.array(trueFalseQuestionSchema),
});

export async function generateAlgorithmQuestions(): Promise<AlgorithmQuestion[]> {
  const structuredLlm = llm.withStructuredOutput(algorithmBatchSchema);
  
  const result = await structuredLlm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(ALGORITHM_PROMPT),
  ]);

  return result.questions.map((q) => ({
    ...q,
    type: "algorithm" as const,
  }));
}

export async function generateTrueFalseQuestions(): Promise<TrueFalseQuestion[]> {
  const structuredLlm = llm.withStructuredOutput(trueFalseBatchSchema);
  
  const result = await structuredLlm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(TRUE_FALSE_PROMPT),
  ]);

  return result.questions.map((q) => ({
    ...q,
    type: "trueFalse" as const,
  }));
}

/**
 * Generate a mixed batch of questions (both types).
 * Calls both generators in parallel and shuffles the results.
 *
 * @returns Array of ~10 mixed Question objects
 */
export async function generateMixedBatch(): Promise<Question[]> {
  const [algorithmQuestions, trueFalseQuestions] = await Promise.all([
    generateAlgorithmQuestions(),
    generateTrueFalseQuestions(),
  ]);

  // Combine and shuffle using Fisher-Yates
  const combined: Question[] = [...algorithmQuestions, ...trueFalseQuestions];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined;
}
