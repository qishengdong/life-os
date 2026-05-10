/**
 * ModelRouter — LLM 抽象层
 *
 * 设计目标:
 *   - 默认 DeepSeek (中国可用、便宜、质量好)
 *   - 一行配置切换到 Claude / OpenAI
 *   - 所有 provider 走 OpenAI 兼容接口 (DeepSeek 原生支持; Claude 在适配时再加)
 */

import OpenAI from 'openai';

export type ModelProvider = 'deepseek' | 'claude' | 'openai';

export interface CompleteOptions {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: ModelProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CompleteResponse {
  content: string;
  model: string;
  provider: ModelProvider;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class ModelRouter {
  private deepseekClient: OpenAI | null = null;
  private openaiClient: OpenAI | null = null;
  // Claude 在 V0 阶段不启用 - 用户当前用 DeepSeek
  // 将来切换时:
  //   1. npm install @anthropic-ai/sdk
  //   2. 在此处 import 并创建 client
  //   3. 在 complete() 中分发到 claude

  constructor() {
    if (process.env.DEEPSEEK_API_KEY) {
      this.deepseekClient = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
      });
    }
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async complete(opts: CompleteOptions): Promise<CompleteResponse> {
    const provider = opts.provider || 'deepseek';

    if (provider === 'deepseek') {
      if (!this.deepseekClient) {
        throw new Error('DEEPSEEK_API_KEY not configured');
      }
      const model = opts.model || 'deepseek-chat';
      const response = await this.deepseekClient.chat.completions.create({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 4000,
      });
      return {
        content: response.choices[0]?.message?.content ?? '',
        model,
        provider: 'deepseek',
        usage: response.usage,
      };
    }

    if (provider === 'openai') {
      if (!this.openaiClient) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      const model = opts.model || 'gpt-4o';
      const response = await this.openaiClient.chat.completions.create({
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 4000,
      });
      return {
        content: response.choices[0]?.message?.content ?? '',
        model,
        provider: 'openai',
        usage: response.usage,
      };
    }

    if (provider === 'claude') {
      throw new Error(
        'Claude provider not yet enabled. To enable: npm i @anthropic-ai/sdk and update model-router/index.ts'
      );
    }

    throw new Error(`Unknown provider: ${provider}`);
  }
}

// Singleton — Next.js 在 dev 模式下会热重载,这样避免每次创建新 client
declare global {
  // eslint-disable-next-line no-var
  var __modelRouter: ModelRouter | undefined;
}

export const modelRouter = global.__modelRouter ?? new ModelRouter();
if (process.env.NODE_ENV !== 'production') {
  global.__modelRouter = modelRouter;
}
