import axios from "axios";

const BASE_URL = "https://openapi.naver.com/v1/search";

type NaverBlogSearchResponse = {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: Array<{
    title: string;
    link: string;
    description: string;
    bloggername: string;
    bloggerlink: string;
    postdate: string;
  }>;
};

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";

async function _request(
  endpoint: string,
  params: Record<string, string | number>
) {
  const res = await axios.get(BASE_URL + endpoint, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
    params,
  });

  return res.data;
}

type BlogSearchOptions = {
  query: string;
  display?: number; // 검색 결과 출력 건수 (기본값 10, 최대 100)
  start?: number; // 검색 시작 위치 (기본값 1, 최대 1000)
  sort?: "sim" | "date"; // 정렬 옵션 (sim: 정확도순, date: 날짜순)
};

async function searchBlog(options: BlogSearchOptions) {
  const { query, display = 10, start = 1, sort = "sim" } = options;

  const data: NaverBlogSearchResponse = await _request("/blog.json", {
    query,
    display,
    start,
    sort,
  });

  return data.items.map((item) => ({
    title: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
    link: item.link,
    description: item.description.replace(/<[^>]*>/g, ""), // HTML 태그 제거
    bloggerName: item.bloggername,
    bloggerLink: item.bloggerlink,
    postDate: item.postdate,
  }));
}

export const naverSearch = { searchBlog };
