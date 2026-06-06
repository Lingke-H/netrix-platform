import { describe, expect, it, vi } from "vitest";

import {
  createOpenAiJsonProvider,
  createMockOpenAiJsonProvider,
  type OpenAiResponsesJsonClient,
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

const requestWithJsonSchema = {
  ...request,
  responseFormat: {
    description: "Recommendation explanation output.",
    name: "recommendation_explanation",
    schema: {
      additionalProperties: false,
      properties: {
        explanationSummary: { type: "string" },
      },
      required: ["explanationSummary"],
      type: "object",
    },
    strict: true,
  },
} satisfies OpenAiJsonRequest;

const recommendationExplanationOutput = {
  complementarySignals: ["Candidate can help with TypeScript debugging"],
  conversationStarter: "Ask how they usually debug COMP1048 React issues.",
  explanationSummary: "You share COMP1048 and web app interests, with complementary TypeScript support.",
  sharedSignals: ["COMP1048", "web apps"],
};

describe("OpenAI JSON provider interface", () => {
  it("parses JSON output from the real OpenAI responses client boundary", async () => {
    const client = {
      responses: {
        create: vi.fn(async () => ({
          id: "resp_123",
          model: "gpt-4.1-mini",
          output_text: JSON.stringify(recommendationExplanationOutput),
          usage: {
            input_tokens: 24,
            output_tokens: 36,
          },
        })),
      },
    } satisfies OpenAiResponsesJsonClient;
    const provider = createOpenAiJsonProvider({ client });

    await expect(provider.generateJson<typeof recommendationExplanationOutput>(requestWithJsonSchema)).resolves.toEqual({
      model: "gpt-4.1-mini",
      output: recommendationExplanationOutput,
      provider: "openai",
      rawResponseId: "resp_123",
      usage: {
        inputTokens: 24,
        outputTokens: 36,
      },
    });
    expect(client.responses.create).toHaveBeenCalledWith({
      input: request.messages,
      model: "gpt-4.1-mini",
      temperature: 0.2,
      text: {
        format: {
          description: "Recommendation explanation output.",
          name: "recommendation_explanation",
          schema: requestWithJsonSchema.responseFormat.schema,
          strict: true,
          type: "json_schema",
        },
      },
    });
  });

  it("rejects invalid JSON from the real OpenAI responses client boundary", async () => {
    const client = {
      responses: {
        create: vi.fn(async () => ({
          id: "resp_invalid",
          output_text: "not json",
        })),
      },
    } satisfies OpenAiResponsesJsonClient;
    const provider = createOpenAiJsonProvider({ client });

    await expect(provider.generateJson(requestWithJsonSchema)).rejects.toThrow(
      "OpenAI JSON provider returned invalid JSON",
    );
  });

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
