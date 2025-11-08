import { useQuery } from "@tanstack/react-query";
import { listArticles } from "../actions/article-actions";
import type { ListArticlesQuery, ListArticlesResponse } from "../lib/dto";

type UseListArticlesOptions = {
  query?: Partial<ListArticlesQuery>;
  enabled?: boolean;
};

export function useListArticles(options: UseListArticlesOptions = {}) {
  const { query, enabled = true } = options;

  return useQuery<ListArticlesResponse>({
    queryKey: ["articles", query],
    queryFn: () => listArticles(query),
    enabled,
  });
}
