/**
 * GET /api/youtube-search?q=... — live video search for Alex's tutor.
 *
 * Keep the YouTube API key on the server. Results are refreshed on each request
 * (with a short CDN cache); videos of 60 seconds or less and #shorts-labelled
 * videos are excluded. YouTube does not expose aspect ratio in search results,
 * so no public API can perfectly identify every newer, longer Short.
 */
type YouTubeItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string }; high?: { url?: string }; default?: { url?: string } };
  };
};

function durationSeconds(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  const q = String(req.query?.q || "").trim().slice(0, 160);
  if (q.length < 2) return res.status(400).json({ error: "Enter a search query of at least 2 characters." });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Video search is not configured yet. Add YOUTUBE_API_KEY to the Vercel project environment variables.",
      videos: [],
    });
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.search = new URLSearchParams({
      key, part: "snippet", type: "video", maxResults: "15",
      safeSearch: "moderate", q,
    }).toString();

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json() as { items?: YouTubeItem[]; error?: { message?: string } };
    if (!searchRes.ok) {
      console.error("[youtube-search] search failed", searchRes.status, searchData.error?.message || "");
      return res.status(searchRes.status === 403 ? 502 : 502).json({ error: "YouTube search is temporarily unavailable." });
    }

    const items = (searchData.items || []).filter((item) => item.id?.videoId);
    if (!items.length) {
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
      return res.status(200).json({ query: q, updated_at: new Date().toISOString(), videos: [] });
    }

    const ids = items.map((item) => item.id!.videoId!).join(",");
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.search = new URLSearchParams({ key, part: "contentDetails,snippet", id: ids }).toString();
    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json() as {
      items?: Array<{ id?: string; contentDetails?: { duration?: string }; snippet?: YouTubeItem["snippet"] }>;
      error?: { message?: string };
    };
    if (!detailsRes.ok) {
      console.error("[youtube-search] details failed", detailsRes.status, detailsData.error?.message || "");
      return res.status(502).json({ error: "Video details are temporarily unavailable." });
    }

    const byId = new Map((detailsData.items || []).map((v) => [v.id, v]));
    const videos = items.flatMap((item) => {
      const id = item.id?.videoId;
      if (!id) return [];
      const detail = byId.get(id);
      const snippet = detail?.snippet || item.snippet || {};
      const title = String(snippet.title || "");
      const seconds = durationSeconds(detail?.contentDetails?.duration || "");
      if (!detail || seconds <= 60 || /#shorts\b|\bshorts\b/i.test(title)) return [];
      const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url;
      return [{
        id, title, channel: snippet.channelTitle || "YouTube creator",
        published_at: snippet.publishedAt || null,
        duration_seconds: seconds,
        duration: Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0"),
        thumbnail: thumb || "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=" + id,
      }];
    }).slice(0, 8);

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).json({ query: q, updated_at: new Date().toISOString(), videos });
  } catch (error) {
    console.error("[youtube-search] request failed", error);
    return res.status(502).json({ error: "Could not reach YouTube right now." });
  }
}
