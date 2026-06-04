export type OpenAiChatMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};

export type OpenAiJsonRequest = {
  messages: OpenAiChatMessage[];
  model: string;
  promptVersion: string;
  temperature?: number;
};

export type OpenAiJsonUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
};

export type OpenAiJsonResponse<TOutput = unknown> = {
  model: string;
  output: TOutput;
  provider: "mock" | "openai";
  rawResponseId: string | null;
  usage: OpenAiJsonUsage;
};

export type OpenAiJsonProvider = {
  generateJson<TOutput = unknown>(request: OpenAiJsonRequest): Promise<OpenAiJsonResponse<TOutput>>;
};

export type MockOpenAiJsonProvider<TOutput = unknown> = OpenAiJsonProvider & {
  calls: OpenAiJsonRequest[];
  output: TOutput | ((request: OpenAiJsonRequest) => Promise<TOutput> | TOutput);
};

export type MockOpenAiJsonProviderOptions<TOutput = unknown> = {
  model?: string;
  output: TOutput | ((request: OpenAiJsonRequest) => Promise<TOutput> | TOutput);
  rawResponseId?: string | null;
  usage?: Partial<OpenAiJsonUsage>;
};

function cloneOpenAiJsonRequest(request: OpenAiJsonRequest): OpenAiJsonRequest {
  return {
    messages: request.messages.map((message) => ({ ...message })),
    model: request.model,
    promptVersion: request.promptVersion,
    temperature: request.temperature,
  };
}

export function createMockOpenAiJsonProvider<TOutput = unknown>(
  options: MockOpenAiJsonProviderOptions<TOutput>,
): MockOpenAiJsonProvider<TOutput> {
  const calls: OpenAiJsonRequest[] = [];

  return {
    calls,
    output: options.output,
    async generateJson<TRequestedOutput = unknown>(
      request: OpenAiJsonRequest,
    ): Promise<OpenAiJsonResponse<TRequestedOutput>> {
      calls.push(cloneOpenAiJsonRequest(request));

      const outputFactory =
        typeof options.output === "function"
          ? (options.output as (request: OpenAiJsonRequest) => Promise<TOutput> | TOutput)
          : null;
      const output =
        outputFactory !== null ? await outputFactory(request) : options.output;

      return {
        model: options.model ?? request.model,
        output: output as TRequestedOutput,
        provider: "mock",
        rawResponseId: options.rawResponseId ?? null,
        usage: {
          inputTokens: options.usage?.inputTokens ?? null,
          outputTokens: options.usage?.outputTokens ?? null,
        },
      };
    },
  };
}
