import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  analysis: router({
    save: publicProcedure
      .input(
        z.object({
          epoch: z.number().int().nonnegative().default(0),
          name: z.string(),
          nodeCount: z.number(),
          edgeCount: z.number(),
          currentDispersion: z.string(),
          candidateDispersion: z.string(),
          epsilon: z.string(),
          adaptationMetric: z.string(),
          decision: z.string(),
          engineVersion: z.string().default("onsour-rts-v1.0.0"),
          numericMode: z.string().default("fixed-q32"),
          governanceVersion: z.string().default("v1"),
          schemaVersion: z.string().default("v1"),
          snapshotHash: z.string().default("sha256-genesis"),
          stateRoot: z.string().default("0x00000000"),
          payloadJson: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id;
        const insertId = await db.saveAnalysis({
          userId: userId ?? null,
          epoch: input.epoch,
          name: input.name,
          nodeCount: input.nodeCount,
          edgeCount: input.edgeCount,
          currentDispersion: input.currentDispersion,
          candidateDispersion: input.candidateDispersion,
          epsilon: input.epsilon,
          adaptationMetric: input.adaptationMetric,
          decision: input.decision,
          engineVersion: input.engineVersion,
          numericMode: input.numericMode,
          governanceVersion: input.governanceVersion,
          schemaVersion: input.schemaVersion,
          snapshotHash: input.snapshotHash,
          stateRoot: input.stateRoot,
          payloadJson: input.payloadJson,
        });
        return { success: true, id: insertId };
      }),
    list: publicProcedure.query(async () => {
      return await db.listSavedAnalyses();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSavedAnalysisById(input.id);
      }),
  }),
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
