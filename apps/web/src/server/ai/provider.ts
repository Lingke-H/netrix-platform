import { getAiClient } from "./client";
import { getAiModelName } from "./model";
import { getServerEnv } from "@/lib/env";

export type OpenAiChatMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};

export type OpenAiJsonResponseFormat = {
  description?: string;
  name: string;
  schema: {
    [key: string]: unknown;
  };
  strict?: boolean;
};

export type OpenAiJsonRequest = {
  messages: OpenAiChatMessage[];
  model: string;
  promptVersion: string;
  responseFormat?: OpenAiJsonResponseFormat;
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

export type OpenAiResponsesJsonCreateRequest = {
  input: OpenAiChatMessage[];
  model: string;
  temperature?: number;
  text: {
    format:
      | {
          type: "json_object";
        }
      | {
          description?: string;
          name: string;
          schema: {
            [key: string]: unknown;
          };
          strict?: boolean;
          type: "json_schema";
        };
  };
};

export type OpenAiResponsesJsonCreateResult = {
  id?: string | null;
  model?: string;
  output_text?: string | null;
  usage?: {
    input_tokens?: number | null;
    output_tokens?: number | null;
  } | null;
};

export type OpenAiResponsesJsonClient = {
  responses: {
    create(request: OpenAiResponsesJsonCreateRequest): Promise<OpenAiResponsesJsonCreateResult>;
  };
};

export type OpenAiJsonProviderOptions = {
  client?: OpenAiResponsesJsonClient;
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
    responseFormat: request.responseFormat
      ? {
          ...request.responseFormat,
          schema: { ...request.responseFormat.schema },
        }
      : undefined,
    temperature: request.temperature,
  };
}

function buildResponseFormat(request: OpenAiJsonRequest): OpenAiResponsesJsonCreateRequest["text"]["format"] {
  if (!request.responseFormat) {
    return {
      type: "json_object",
    };
  }

  return {
    description: request.responseFormat.description,
    name: request.responseFormat.name,
    schema: request.responseFormat.schema,
    strict: request.responseFormat.strict,
    type: "json_schema",
  };
}

function parseOpenAiJsonOutput(outputText: string | null | undefined) {
  if (!outputText) {
    throw new Error("OpenAI JSON provider returned an empty response.");
  }

  try {
    return JSON.parse(outputText) as unknown;
  } catch (error) {
    throw new Error(
      `OpenAI JSON provider returned invalid JSON: ${error instanceof Error ? error.message : "unknown parse error"}`,
    );
  }
}

export function createOpenAiJsonProvider(options: OpenAiJsonProviderOptions = {}): OpenAiJsonProvider {
  const client = options.client ?? (getAiClient() as unknown as OpenAiResponsesJsonClient);

  return {
    async generateJson<TOutput = unknown>(request: OpenAiJsonRequest): Promise<OpenAiJsonResponse<TOutput>> {
      const response = await client.responses.create({
        input: request.messages,
        model: request.model,
        temperature: request.temperature,
        text: {
          format: buildResponseFormat(request),
        },
      });

      return {
        model: response.model ?? request.model,
        output: parseOpenAiJsonOutput(response.output_text) as TOutput,
        provider: "openai",
        rawResponseId: response.id ?? null,
        usage: {
          inputTokens: response.usage?.input_tokens ?? null,
          outputTokens: response.usage?.output_tokens ?? null,
        },
      };
    },
  };
}

export function createConfiguredOpenAiJsonProvider(): OpenAiJsonProvider | null {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return null;
  }

  const { OPENAI_API_KEY } = getServerEnv();

  if (!OPENAI_API_KEY) {
    return null;
  }

  return createOpenAiJsonProvider();
}

export function getConfiguredOpenAiJsonModelName() {
  return getAiModelName();
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
