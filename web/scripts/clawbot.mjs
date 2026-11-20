import { randomBytes, randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

const base = "https://ilinkai.weixin.qq.com";
const headers = { "iLink-App-Id": "bot", "iLink-App-ClientVersion": "196608" };
const lifetime = 5 * 60 * 1000;
const sessions = new Map();

async function weixin(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    redirect: "error",
    signal: AbortSignal.timeout(35000),
  });
  if (!response.ok) throw new Error("Weixin request failed");
  return response.json();
}

function reply(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

export async function handleClawBot(req, res, url) {
  if (req.headers.origin && req.headers.origin !== url.origin) return reply(res, 403, {});
  for (const [id, session] of sessions) {
    if (session.expiresAt <= Date.now() && !session.account) sessions.delete(id);
  }

  try {
    if (req.method === "POST" && url.pathname === "/api/clawbot") {
      if (sessions.size >= 32) return reply(res, 429, {});
      const qr = await weixin(base + "/ilink/bot/get_bot_qrcode?bot_type=3", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          AuthorizationType: "ilink_bot_token",
          "X-WECHAT-UIN": Buffer.from(String(randomBytes(4).readUInt32BE())).toString("base64"),
        },
        body: JSON.stringify({ local_token_list: [] }),
      });
      if (!qr.qrcode || typeof qr.qrcode_img_content !== "string" || !qr.qrcode_img_content) {
        throw new Error("Missing QR code");
      }
      const id = randomUUID();
      const expiresAt = Date.now() + lifetime;
      const svg = renderToStaticMarkup(createElement(QRCodeSVG, {
        value: qr.qrcode_img_content, size: 224, marginSize: 4,
      }));
      sessions.set(id, { code: qr.qrcode, expiresAt, base, status: "wait" });
      return reply(res, 200, { id, expiresAt, image: "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64") });
    }

    const session = sessions.get(url.searchParams.get("id"));
    if (req.method === "DELETE") {
      if (session && !session.account) sessions.delete(url.searchParams.get("id"));
      return reply(res, 200, {});
    }
    if (req.method !== "GET" && req.method !== "POST") return reply(res, 405, {});
    if (!session) return reply(res, 200, { status: "expired" });
    if (session.account) return reply(res, 200, { status: "confirmed" });
    if (session.polling) return reply(res, 200, { status: session.status });
    session.polling = true;
    try {
      const query = new URLSearchParams({ qrcode: session.code });
      if (req.method === "POST") {
        if (session.status !== "pin") return reply(res, 409, {});
        let pin = "";
        for await (const chunk of req) {
          pin += chunk;
          if (pin.length > 12) break;
        }
        if (!/^\d{1,12}$/.test(pin)) return reply(res, 400, {});
        query.set("verify_code", pin);
      } else if (session.status === "pin") {
        return reply(res, 200, { status: "pin" });
      }

      const result = await weixin(session.base + "/ilink/bot/get_qrcode_status?" + query, { headers });
      if (!sessions.has(url.searchParams.get("id"))) return reply(res, 200, { status: "expired" });
      switch (result.status) {
        case "confirmed":
          if (!result.bot_token || !result.ilink_bot_id) throw new Error("Missing binding credentials");
          session.account = { token: result.bot_token, id: result.ilink_bot_id, base: result.baseurl };
          session.code = "";
          session.status = "confirmed";
          break;
        case "scaned_but_redirect": {
          const host = result.redirect_host;
          if (typeof host !== "string" || !/^[a-z0-9.-]+\.weixin\.qq\.com$/i.test(host)) {
            throw new Error("Unexpected Weixin polling host");
          }
          session.base = "https://" + host;
          session.status = "scanned";
          break;
        }
        case "scaned": session.status = "scanned"; break;
        case "need_verifycode":
        case "confirmed_but_need_verifycode": session.status = "pin"; break;
        case "expired":
        case "verify_code_blocked":
          sessions.delete(url.searchParams.get("id"));
          session.status = "expired";
          break;
        case "binded_redirect":
          session.status = "already-bound";
          break;
        case "wait":
          if (session.status === "pin") session.status = "scanned";
          break;
        default: throw new Error("Unexpected Weixin status");
      }
      return reply(res, 200, { status: session.status });
    } finally {
      session.polling = false;
    }
  } catch {
    return reply(res, 502, {});
  }
}
