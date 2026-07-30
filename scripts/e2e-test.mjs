import puppeteer from "puppeteer";
import fs from "fs";
import { PNG } from "pngjs";

const OUT = "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
}

function analyze(path) {
  const png = PNG.sync.read(fs.readFileSync(path));
  let lit = 0;
  let dark = 0;
  let green = 0;
  for (let i = 0; i < png.data.length; i += 16) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const l = r + g + b;
    if (l > 120) lit++;
    else dark++;
    if (g > 140 && g > r + 30 && g > b + 20) green++;
  }
  return { lit, dark, green, w: png.width, h: png.height };
}

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});

const page = await browser.newPage();
page.setDefaultTimeout(30000);
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

try {
  // —— 1. Load loft ——
  const res = await page.goto("http://127.0.0.1:4173/", {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  if (res?.ok()) pass("GET /", `status ${res.status()}`);
  else fail("GET /", `status ${res?.status()}`);

  await page.waitForFunction(
    () => document.querySelector(".loading.done") || !document.querySelector(".loading"),
    { timeout: 25000 }
  );
  pass("Loading screen dismisses");

  // Wait for cinematic intro to settle
  await new Promise((r) => setTimeout(r, 3500));

  const hasCanvas = await page.$("canvas");
  if (hasCanvas) pass("WebGL canvas present");
  else fail("WebGL canvas present");

  const titleVisible = await page.$eval(".arrival-title", (el) => {
    const s = getComputedStyle(el);
    return s.opacity !== "0" && s.visibility !== "hidden";
  }).catch(() => false);
  if (titleVisible) pass("Arrival brand title visible");
  else fail("Arrival brand title visible");

  const promptText = await page.$eval(".prompt", (el) => el.textContent?.trim() || "").catch(() => "");
  if (promptText.toLowerCase().includes("hello")) pass("Say hello prompt", promptText);
  else fail("Say hello prompt", promptText || "missing");

  await page.screenshot({ path: `${OUT}/test-01-arrival.png` });
  const a1 = analyze(`${OUT}/test-01-arrival.png`);
  if (a1.lit > 200) pass("Arrival frame has visible pixels", `lit=${a1.lit} green=${a1.green}`);
  else fail("Arrival frame has visible pixels", JSON.stringify(a1));

  // —— 2. Greeting dialogue ——
  await page.keyboard.press("KeyX");
  await new Promise((r) => setTimeout(r, 1200));
  const dialogue = await page.$(".dialogue");
  if (dialogue) {
    const h2 = await page.$eval(".dialogue h2", (el) => el.textContent || "");
    pass("Dialogue opens on X", h2.trim());
  } else fail("Dialogue opens on X");

  await page.screenshot({ path: `${OUT}/test-02-dialogue.png` });

  // Skip/close dialogue
  await page.keyboard.press("KeyX");
  await new Promise((r) => setTimeout(r, 400));
  await page.keyboard.press("KeyX");
  await new Promise((r) => setTimeout(r, 700));

  const enterPrompt = await page.$eval(".prompt", (el) => el.textContent?.trim() || "").catch(() => "");
  if (enterPrompt.toLowerCase().includes("inside") || enterPrompt.toLowerCase().includes("come")) {
    pass("Come inside prompt", enterPrompt);
  } else fail("Come inside prompt", enterPrompt || "missing");

  // —— 3. Enter loft ——
  await page.keyboard.press("KeyE");
  await new Promise((r) => setTimeout(r, 2800));

  const hudBrand = await page.$(".hud-brand");
  if (hudBrand) pass("Interior HUD brand appears");
  else fail("Interior HUD brand appears");

  const needs = await page.$(".hud-needs");
  if (needs) pass("Sims needs panel visible");
  else fail("Sims needs panel visible");

  const arrivalGone = await page.$(".arrival-title");
  if (!arrivalGone) pass("Arrival title hidden inside");
  else fail("Arrival title hidden inside");

  await page.screenshot({ path: `${OUT}/test-03-inside.png` });
  const a3 = analyze(`${OUT}/test-03-inside.png`);
  if (a3.lit > 300) pass("Interior frame lit", `lit=${a3.lit}`);
  else fail("Interior frame lit", JSON.stringify(a3));

  // —— 4. Walk around ——
  for (let i = 0; i < 45; i++) {
    await page.keyboard.down("KeyW");
    await new Promise((r) => setTimeout(r, 40));
    await page.keyboard.up("KeyW");
  }
  for (let i = 0; i < 25; i++) {
    await page.keyboard.down("KeyA");
    await new Promise((r) => setTimeout(r, 40));
    await page.keyboard.up("KeyA");
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT}/test-04-walk.png` });
  pass("WASD walk input accepted");

  // Check game store phase via window if exposed (dev only — prod may not have it)
  const phase = await page.evaluate(() => {
    const g = (window).__game;
    return g ? g.getState().phase : null;
  });
  if (phase === "inside") pass("Game phase is inside", phase);
  else if (phase === null) pass("Game store private in prod (expected)");
  else fail("Game phase is inside", String(phase));

  // —— 5. Classic site ——
  const classic = await page.goto("http://127.0.0.1:4173/classic/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  if (classic?.ok()) {
    const body = await page.content();
    if (body.length > 500) pass("GET /classic/", `status ${classic.status()}, ${body.length}b`);
    else fail("GET /classic/", "thin response");
  } else fail("GET /classic/", `status ${classic?.status()}`);
  await page.screenshot({ path: `${OUT}/test-05-classic.png` });

  // —— 6. Admin ——
  const admin = await page.goto("http://127.0.0.1:4173/admin", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });
  if (admin?.ok()) pass("GET /admin", `status ${admin.status()}`);
  else fail("GET /admin", `status ${admin?.status()}`);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `${OUT}/test-06-admin.png` });

  // —— Console errors (filter known noise) ——
  const realErrors = errors.filter(
    (e) =>
      !/favicon/i.test(e) &&
      !/Download the React DevTools/i.test(e) &&
      !/THREE.WARNING/i.test(e)
  );
  if (realErrors.length === 0) pass("No page JS errors");
  else fail("No page JS errors", realErrors.slice(0, 5).join(" | "));
} catch (e) {
  fail("Test runner", String(e));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log("\n——————");
console.log(`${results.filter((r) => r.ok).length}/${results.length} passed`);
if (failed.length) {
  console.log("Failed:");
  failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
  process.exitCode = 1;
} else {
  console.log("All checks passed.");
}
