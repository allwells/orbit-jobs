import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export type AIProvider = "openai" | "anthropic" | "google";
export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | "gemini-2.5-flash"
  | "gemini-2.0-flash"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash";

export interface AIModelConfig {
  provider: AIProvider;
  model: AIModel;
  displayName: string;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    provider: "google",
    model: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
  },
  { provider: "openai", model: "gpt-4o", displayName: "GPT-4o" },
  { provider: "openai", model: "gpt-4o-mini", displayName: "GPT-4o Mini" },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
  },
  {
    provider: "google",
    model: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
  },
  {
    provider: "google",
    model: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
  },
  {
    provider: "google",
    model: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
  },
];

export function getAIModel(provider: AIProvider, model: AIModel) {
  switch (provider) {
    case "openai":
      return openai(model);
    case "anthropic":
      return anthropic(model);
    case "google":
      return google(model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
