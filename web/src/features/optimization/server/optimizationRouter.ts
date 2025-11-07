import { z } from "zod/v4";
import { createTRPCRouter, protectedProjectProcedure } from "@/src/server/api/trpc";
import { configureItsHub } from "./service";
import { logger } from "@langfuse/shared/src/server";

export const optimizationRouter = createTRPCRouter({
  /**
   * Configure ITS-Hub with Best-of-N algorithm settings
   * Assumes ITS-Hub and Portkey Gateway are already running
   */
  configure: protectedProjectProcedure
    .input(
      z.object({
        projectId: z.string(), // Required for protectedProjectProcedure
        provider: z.string().min(1, "Provider is required"),
        model: z.string().min(1, "Model is required"),
        judgeModel: z.string().min(1, "Judge model is required"),
        judgeMode: z.enum(["pairwise", "groupwise", "pointwise"]),
        judgeTemperature: z
          .number()
          .min(0, "Temperature must be >= 0")
          .max(2, "Temperature must be <= 2"),
        judgeMaxTokens: z
          .number()
          .int()
          .positive("Max tokens must be positive"),
        judgeCriterion: z.string().min(1, "Judge criterion is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { projectId } = ctx;

      logger.info("Configuring ITS-Hub", {
        projectId,
        provider: input.provider,
        model: input.model,
      });

      // Configure ITS-Hub with the provided settings
      const result = await configureItsHub({
        provider: input.provider,
        model: input.model,
        judgeModel: input.judgeModel,
        judgeMode: input.judgeMode,
        judgeTemperature: input.judgeTemperature,
        judgeMaxTokens: input.judgeMaxTokens,
        judgeCriterion: input.judgeCriterion,
      });

      logger.info("ITS-Hub configured successfully", {
        projectId,
      });

      return result;
    }),
});
