#!/usr/bin/env node
/**
 * Visual check tool — screenshots a route in light and dark, full page.
 *
 * Drives Chrome over the DevTools Protocol rather than the `--screenshot` flag,
 * because only CDP can emulate `prefers-color-scheme` (which is how dark mode
 * is verified) and capture beyond the viewport.
 *
 * Usage:
 *   node scripts/screenshot.mjs /style-guide            both themes, full page
 *   node scripts/screenshot.mjs /style-guide --dark     dark only
 *   node scripts/screenshot.mjs / --width 420           mobile width
 *
 * Env: BASE_URL (default http://localhost:3000), OUT_DIR (default ./.screenshots)
 *
 * This is a development tool, not part of the build. Phase 16 adds the
 * automated axe and Lighthouse passes; this is for looking at things.
 */

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const args = process.argv.slice(2);
const route = args.find((a) => a.startsWith("/")) ?? "/";
const widthArg = args.indexOf("--width");
const width = widthArg > -1 ? Number(args[widthArg + 1]) : 1280;
const themes = args.includes("--dark")
  ? ["dark"]
  : args.includes("--light")
    ? ["light"]
    : ["light", "dark"];

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const outDir = resolve(process.cwd(), process.env.OUT_DIR ?? ".screenshots");
const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));

if (!chrome) {
  console.error("  No Chrome or Edge found. Set one of:", CHROME_CANDIDATES.join(", "));
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const port = 9222 + Math.floor(Math.random() * 300);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    "--user-data-dir=" + resolve(outDir, ".chrome-profile"),
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevTools() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools did not become available");
}

/** Minimal CDP client over the global WebSocket in Node 22+. */
function connect(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;

  const ready = new Promise((res, rej) => {
    ws.addEventListener("open", () => res());
    ws.addEventListener("error", rej);
  });

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    const entry = pending.get(msg.id);
    if (entry) {
      pending.delete(msg.id);
      if (msg.error) entry.reject(new Error(msg.error.message));
      else entry.resolve(msg.result);
    }
  });

  return {
    ready,
    send(method, params = {}, sessionId) {
      const id = nextId++;
      return new Promise((resolve_, reject) => {
        pending.set(id, { resolve: resolve_, reject });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
    close: () => ws.close(),
  };
}

try {
  const wsUrl = await waitForDevTools();
  const cdp = connect(wsUrl);
  await cdp.ready;

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    {
      width,
      height: 900,
      deviceScaleFactor: 2,
      mobile: width < 768,
    },
    sessionId,
  );

  for (const theme of themes) {
    await cdp.send(
      "Emulation.setEmulatedMedia",
      { features: [{ name: "prefers-color-scheme", value: theme }] },
      sessionId,
    );

    await cdp.send("Page.navigate", { url: `${baseUrl}${route}` }, sessionId);
    await sleep(2500); // fonts, hydration, and the SVG illustrations

    const { data } = await cdp.send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true },
      sessionId,
    );

    const name = `${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${theme}-${width}.png`;
    const file = resolve(outDir, name);
    writeFileSync(file, Buffer.from(data, "base64"));
    console.log(`  ${theme.padEnd(5)} ${width}px  ->  ${file}`);
  }

  cdp.close();
} finally {
  proc.kill();
}
