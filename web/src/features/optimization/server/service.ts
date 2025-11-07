import { env } from "@/src/env.mjs";
import { logger, traceException } from "@langfuse/shared/src/server";
import { TRPCError } from "@trpc/server";

/**
 * Configuration payload for ITS-Hub
 */
export interface ItsHubConfig {
  provider: string;
  model: string;
  judgeModel: string;
  judgeMode: string;
  judgeTemperature: number;
  judgeMaxTokens: number;
  judgeCriterion: string;
}

/**
 * Send configuration to ITS-Hub
 */
export async function configureItsHub(
  config: ItsHubConfig,
): Promise<{ success: boolean; response: unknown }> {
  const configureUrl = `${env.ITS_HUB_URL}/configure`;

  logger.info("Configuring ITS-Hub", {
    url: configureUrl,
    provider: config.provider,
    model: config.model,
  });

  try {
    const payload = {
      provider: config.provider,
      endpoint: "auto",
      api_key: process.env.OPENAI_API_KEY || "",
      model: config.model,
      alg: "best-of-n",
      rm_name: "llm-judge",
      judge_model: config.judgeModel,
      judge_base_url: "auto",
      judge_mode: config.judgeMode,
      judge_criterion: config.judgeCriterion,
      judge_api_key: process.env.OPENAI_API_KEY || "",
      judge_temperature: config.judgeTemperature,
      judge_max_tokens: config.judgeMaxTokens,
    };

    const response = await fetch(configureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("ITS-Hub configuration failed", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `ITS-Hub configuration failed: ${response.statusText}`,
        cause: new Error(errorText),
      });
    }

    const result = await response.json();
    logger.info("ITS-Hub configured successfully", { result });

    return { success: true, response: result };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Failed to configure ITS-Hub", {
      error: error instanceof Error ? error.message : String(error),
    });
    traceException(error);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to configure ITS-Hub. Check server logs for details.",
      cause: error,
    });
  }
}
