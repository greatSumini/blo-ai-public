import axios from "axios";

const VERSION = "v3";

const BASE_URL = `https://api.dataforseo.com/${VERSION}`;

type KeywordSuggestionResponse = {
  status_code: string;
  tasks: Array<{
    status_code: string;
    result_count: number;
    result: Array<{
      seed_keyword: string;
      items_count: number;
      items: Array<{
        keyword: string;
        keyword_info: {
          search_volume: number;
          competition: number;
          cpc: number;
        };
      }>;
    }>;
  }>;
};

const D4SEO_API_USER = process.env.DATAFORSEO_LOGIN || "";
const D4SEO_API_KEY = process.env.DATAFORSEO_PASSWORD || "";

async function _request(path: string, body: any) {
  const res = await axios.post(BASE_URL + path, body, {
    headers: {
      Authorization: `Basic ${btoa(`${D4SEO_API_USER}:${D4SEO_API_KEY}`)}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
}

async function requestSuggestions(keyword: string) {
  const data: KeywordSuggestionResponse = await _request(
    "/dataforseo_labs/google/keyword_suggestions/live",
    [{ keyword, limit: 10, exact_match: false }]
  );

  return data.tasks[0].result[0].items.map((item) => ({
    keyword: item.keyword,
    competition: item.keyword_info.competition,
    volume: item.keyword_info.search_volume,
    cpc: item.keyword_info.cpc,
  }));
}

export const d4seo = { requestSuggestions };
