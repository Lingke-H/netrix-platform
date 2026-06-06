import { describe, expect, it, vi } from "vitest";

import {
  createMockOpenAiJsonProvider,
  type OpenAiJsonProvider,
  type OpenAiJsonRequest,
} from "@/server/ai/provider";

const request = {
  messages: [
    {
      content: "Explain academic recommendation signals.",
      role: "system",
    },
    {
      content: "Prompt version: recommendation-explanation.v1",
      role: "user",
    },
  ],
  model: "gpt-4.1-mini",
  promptVersion: "recommendation-explanation.v1",
  temperature: 0.2,
} satisfies OpenAiJsonRequest;

const recommendationExplanationOutput = {
  complementarySignals: ["Candidate can help with TypeScript debugging"],
  conversationStarter: "Ask how they usually debug COMP1048 React issues.",
  explanationSummary: "You share COMP1048 and web app interests, with complementary TypeScript support.",
  sharedSignals: ["COMP1048", "web apps"],
};

describe("OpenAI JSON provider interface", () => {
  it("returns configured mock JSON output through the provider interface", async () => {
    const mockProvider = createMockOpenAiJsonProvider({
      output: recommendationExplanationOutput,
      rawResponseId: "mock-response-1",
      usage: {
        inputTokens: 24,
        outputTokens: 36,
      },
    });
    const provider: OpenAiJsonProvider = mockProvider;

    await expect(provider.generateJson<typeof recommendationExplanationOutput>(request)).resolves.toEqual({
      model: "gpt-4.1-mini",
      output: recommendationExplanationOutput,
      provider: "mock",
      rawResponseId: "mock-response-1",
      usage: {
        inputTokens: 24,
        outputTokens: 36,
      },
    });
    expect(mockProvider.calls).toEqual([request]);
  });

  it("lets mock output functions inspect the request without invoking OpenAI", async () => {
    const buildOutput = vi.fn((providerRequest: OpenAiJsonRequest) => ({
      complementarySignals: [],
      conversationStarter: "Ask which shared module they want to discuss first.",
      explanationSummary: `Built from ${providerRequest.promptVersion}.`,
      sharedSignals: providerRequest.messages.map((message) => message.role),
    }));
    const provider = createMockOpenAiJsonProvider({
      model: "mock-recommendation-explainer",
      output: buildOutput,
    });

    await expect(provider.generateJson(request)).resolves.toEqual({
      model: "mock-recommendation-explainer",
      output: {
        complementarySignals: [],
        conversationStarter: "Ask which shared module they want to discuss first.",
        explanationSummary: "Built from recommendation-explanation.v1.",
        sharedSignals: ["system", "user"],
      },
      provider: "mock",
      rawResponseId: null,
      usage: {
        inputTokens: null,
        outputTokens: null,
      },
    });
    expect(buildOutput).toHaveBeenCalledWith(request);
    expect(provider.calls).toEqual([request]);
  });
});
