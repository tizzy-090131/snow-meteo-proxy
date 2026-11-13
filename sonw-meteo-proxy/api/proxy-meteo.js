export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const allowOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost",
    "https://tizzy‑090131.github.io"
    "https://tizzy‑090131.github.io/snow‑scene"
  ];

  const origin = req.headers.get("origin") || "";
  const corsHeaders = {
    "Access‑Control‑Allow‑Methods": "GET, OPTIONS",
    "Access‑Control‑Allow‑Headers": "*",
  };

  if (allowOrigins.includes(origin)) {
    corsHeaders["Access‑Control‑Allow‑Origin"] = origin;
  } else {
    corsHeaders["Access‑Control‑Allow‑Origin"] = allowOrigins[0];
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return Response.json({ error: "only GET allowed" }, { status: 405, headers: corsHeaders });
  }

  const searchParams = new URL(req.url).searchParams;
  const targetQuery = searchParams.toString();
  const targetUrl = `https://api.open‑meteo.com/v1/forecast?${targetQuery}`;

  try {
    const upstreamResp = await fetch(targetUrl, {
      method: "GET",
      signal: AbortSignal.timeout(10000)
    });
    const data = await upstreamResp.json();
    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: "upstream api fail" }, { status: 503, headers: corsHeaders });
  }
}
