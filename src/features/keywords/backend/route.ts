import type { Hono } from "hono";
import { failure } from "@/backend/http/response";
import { respondWithDomain, respondCreated } from "@/backend/http/mapper";
import {
  getLogger,
  getSupabase,
  getConfig,
  type AppEnv,
} from "@/backend/hono/context";
import {
  ListKeywordsSchema,
  CreateKeywordSchema,
  BulkCreateKeywordsSchema,
  KeywordSuggestionsSchema,
  DeleteKeywordSchema,
} from "./schema";
import {
  listKeywords,
  createKeyword,
  bulkCreateKeywords,
  fetchKeywordSuggestions,
  fetchLongTailSuggestions,
  deleteKeyword,
} from "./service";

export const registerKeywordsRoutes = (app: Hono<AppEnv>) => {
  // GET /api/keywords
  app.get("/api/keywords", async (c) => {
    const parsedQuery = ListKeywordsSchema.safeParse({
      query: c.req.query("query"),
      page: c.req.query("page"),
      limit: c.req.query("limit"),
    });

    if (!parsedQuery.success) {
      return c.json(
        failure(
          400,
          "INVALID_QUERY_PARAMS",
          "Invalid query parameters",
          parsedQuery.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await listKeywords(supabase, parsedQuery.data);
    return respondWithDomain(c, result);
  });

  // POST /api/keywords
  app.post("/api/keywords", async (c) => {
    const body = await c.req.json();
    const parsedBody = CreateKeywordSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          "INVALID_REQUEST_BODY",
          "Invalid request body",
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await createKeyword(supabase, parsedBody.data);
    return respondCreated(c, result);
  });

  // POST /api/keywords/bulk
  app.post("/api/keywords/bulk", async (c) => {
    const body = await c.req.json();
    const parsedBody = BulkCreateKeywordsSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          "INVALID_REQUEST_BODY",
          "Invalid request body",
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const result = await bulkCreateKeywords(supabase, logger, parsedBody.data);
    return respondCreated(c, result);
  });

  // POST /api/keywords/suggestions
  app.post("/api/keywords/suggestions", async (c) => {
    const body = await c.req.json();
    const parsedBody = KeywordSuggestionsSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          "INVALID_REQUEST_BODY",
          "Invalid request body",
          parsedBody.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const config = getConfig(c);
    const result = await fetchKeywordSuggestions(
      supabase,
      logger,
      config,
      parsedBody.data
    );
    return respondWithDomain(c, result);
  });

  app.post("/api/keywords/long-tails", async (c) => {
    const body = await c.req.json();
    const parsedBody = KeywordSuggestionsSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json(
        failure(
          400,
          "INVALID_REQUEST_BODY",
          "Invalid request body",
          parsedBody.error.format()
        ),
        400
      );
    }

    const result = await fetchLongTailSuggestions(parsedBody.data);
    return respondWithDomain(c, result);
  });

  // DELETE /api/keywords/:id
  app.delete("/api/keywords/:id", async (c) => {
    const id = c.req.param("id");
    const parsedId = DeleteKeywordSchema.safeParse({ id });

    if (!parsedId.success) {
      return c.json(
        failure(
          400,
          "INVALID_KEYWORD_ID",
          "Invalid keyword ID",
          parsedId.error.format()
        ),
        400
      );
    }

    const supabase = getSupabase(c);
    const result = await deleteKeyword(supabase, parsedId.data);
    return respondWithDomain(c, result);
  });
};
