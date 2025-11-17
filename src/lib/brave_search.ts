import { bravesearch, BraveSearchClient } from "@agentic/brave-search";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY || "";

const client = new BraveSearchClient({
  apiKey: BRAVE_API_KEY,
});

type WebSearchOptions = {
  query: string;
  count?: number; // 검색 결과 출력 건수 (기본값 10, 최대 20)
  offset?: number; // 검색 시작 위치 (기본값 0)
};

async function searchWeb(options: WebSearchOptions) {
  const { query, count = 10, offset = 0 } = options;

  const params: bravesearch.SearchParams = {
    query,
    count,
    offset,
  };

  const data = await client.search(params);

  return {
    query,
    results:
      data.web?.results.map((item) => ({
        title: item.title,
        url: item.url,
        description: item.description,
        language: item.language,
        published: item.published,
        rank: item.rank,
      })) ?? [],
  };
}

export const braveSearch = { searchWeb };
