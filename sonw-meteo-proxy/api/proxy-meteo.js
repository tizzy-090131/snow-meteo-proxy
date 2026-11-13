export const config = {
  runtime: "edge"
};

export default async function handler(request) {
  const ALLOW_ORIGIN = "https://tizzy-090131.github.io";
  const reqOrigin = request.headers.get("origin") || "";

  // 处理 OPTIONS 预检请求（跨域必加，很多人漏掉这个）
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": ALLOW_ORIGIN,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin"
      }
    });
  }

  // 只放行 GET
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 把浏览器传过来的查询参数原样转发给 open-meteo
  const urlParams = new URL(request.url).search;
  const targetUrl = `https://api.open-meteo.com/v1/forecast${urlParams}`;

  try {
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(8000) // 8秒超时
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": ALLOW_ORIGIN,
        "Vary": "Origin"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "fetch open-meteo timeout" }), {
      status: 504,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOW_ORIGIN
      }
    });
  }
}
