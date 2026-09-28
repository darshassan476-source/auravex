import "server-only";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Browser } from "../agent/browser";
import { buildStageHtml, totalSeconds, type StageManifest } from "./stage";

/**
 * Turns a stage manifest into an H.264 file.
 *
 * Chrome renders the stage one frame at a time at the film's pixel ratio;
 * each frame is piped straight into ffmpeg, so nothing but the finished
 * MP4 (and its poster) touches the disk. 1080p and 4K differ only in the
 * device pixel ratio the page is rastered at.
 */

export type Resolution = "1080p" | "4k";

export const RESOLUTIONS: Record<Resolution, { width: number; height: number; scale: number }> = {
  "1080p": { width: 1920, height: 1080, scale: 1 },
  "4k": { width: 3840, height: 2160, scale: 2 },
};

export function ffmpegPath(): string {
  if (process.env.FFMPEG_PATH && existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  try {
    // Loaded this way so the bundler does not try to follow the binary.
    const mod = (process as unknown as { getBuiltinModule: (n: string) => { createRequire: (p: string) => NodeRequire } }).getBuiltinModule("node:module");
    const req = mod.createRequire(path.join(process.cwd(), "package.json"));
    const installer = req("@ffmpeg-installer/ffmpeg") as { path: string };
    if (installer.path && existsSync(installer.path)) return installer.path;
  } catch {
    /* fall through */
  }
  throw new Error("ffmpeg is not available. Run `npm install` again or set FFMPEG_PATH in .env.");
}

/** The site's own Inter files, so the film's type matches the pages. */
export function fontFiles(): string[] {
  const dir = path.join(process.cwd(), ".next", "static", "media");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".woff2"));
  // The preload subset carries the Latin glyphs; list it last so it wins.
  files.sort((a, b) => Number(a.includes(".p.")) - Number(b.includes(".p.")));
  return files.map((f) => pathToFileURL(path.join(dir, f)).href);
}

export interface RenderInput {
  dir: string;
  manifest: StageManifest;
  resolution: Resolution;
  /** Path to an audio file to lay under the picture. */
  music?: string;
  onProgress?: (fraction: number, note?: string) => void;
}

export interface RenderOutput {
  file: string;
  poster: string;
  seconds: number;
  width: number;
  height: number;
  frames: number;
}

export async function renderFilm(input: RenderInput): Promise<RenderOutput> {
  const { width, height, scale } = RESOLUTIONS[input.resolution];
  const fps = input.manifest.fps;
  const seconds = totalSeconds(input.manifest.shots);
  const frames = Math.round(seconds * fps);
  mkdirSync(input.dir, { recursive: true });

  // The out-of-focus room is made once, here, rather than blurred live on every frame.
  let plateBlur: string | undefined;
  try {
    const source = fileURLToPath(input.manifest.plate);
    const blurred = path.join(input.dir, "plate-blur.jpg");
    const r = spawnSync(ffmpegPath(), ["-y", "-loglevel", "error", "-i", source, "-vf", "gblur=sigma=18", "-q:v", "3", blurred]);
    if (r.status === 0 && existsSync(blurred)) plateBlur = pathToFileURL(blurred).href;
  } catch {
    /* the stage falls back to the sharp plate */
  }

  const stagePath = path.join(input.dir, "stage.html");
  writeFileSync(stagePath, buildStageHtml({ ...input.manifest, width, height, plateBlur }));
  const outFile = path.join(input.dir, `film-${input.resolution}.mp4`);
  const posterFile = path.join(input.dir, "poster.jpg");

  const browser = new Browser({ width: 1920, height: 1080, scale });
  await browser.launch();
  let ffmpeg: ReturnType<typeof spawn> | null = null;
  try {
    await browser.navigate(pathToFileURL(stagePath).href, 400);
    // The stage is laid out at exactly 1920x1080 CSS pixels; pin the viewport to
    // it so every frame is the same size, whatever the window decorations do.
    await browser.send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: scale, mobile: false });
    await browser.evaluate("window.__ready");

    const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-vcodec", "mjpeg", "-i", "-"];
    if (input.music && existsSync(input.music)) {
      const fadeOut = Math.max(0, seconds - 3);
      // Trimmed or padded to the film's exact length, so a short bed never shortens the picture.
      args.push("-i", input.music, "-filter_complex", `[1:a]aresample=48000,atrim=0:${seconds},apad=whole_len=${seconds * 48000},afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOut}:d=3,volume=0.9[a]`, "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-shortest");
    }
    // Exact output size: H.264 needs even dimensions, and the film is promised at this size.
    args.push("-vf", `scale=${width}:${height}:flags=lanczos`, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(fps), "-movflags", "+faststart", outFile);

    ffmpeg = spawn(ffmpegPath(), args, { stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    ffmpeg.stderr?.on("data", (d) => (stderr += String(d)));
    const exit = new Promise<number>((resolve) => ffmpeg!.on("close", (code) => resolve(code ?? 1)));
    const stdin = ffmpeg.stdin!;
    let failed: Error | null = null;
    stdin.on("error", (e) => (failed = e));
    // If ffmpeg quits, waiting for the pipe to drain would wait forever.
    const quit = exit.then(() => {
      throw new Error("ffmpeg stopped early.");
    });
    quit.catch(() => undefined);

    let lastNote = -1;
    try {
      for (let i = 0; i < frames; i++) {
        if (failed) break;
        await browser.evaluate(`window.__setFrame(${i})`);
        const jpeg = await browser.screenshot("jpeg", 91, true);
        if (!stdin.write(jpeg)) await Promise.race([once(stdin, "drain"), quit]);
        const pct = Math.floor((i / frames) * 20);
        if (pct !== lastNote) {
          lastNote = pct;
          input.onProgress?.(i / frames, `frame ${i + 1} of ${frames}`);
        }
      }
      stdin.end();
    } catch (error) {
      // A broken pipe means ffmpeg quit; its own words are the useful ones.
      stdin.destroy();
      const code = await exit;
      throw new Error(`ffmpeg stopped (${code}): ${stderr.trim().slice(-400) || (error instanceof Error ? error.message : String(error))}`);
    }
    const code = await exit;
    if (failed || code !== 0) throw new Error(`ffmpeg failed (${code}): ${stderr.trim().slice(-400) || "no detail"}`);

    // Poster: the first product screen, a moment in.
    const shots = input.manifest.shots;
    let at = 0;
    for (const shot of shots) {
      if (shot.kind === "screen" || shot.kind === "clip") {
        at += Math.min(2, shot.seconds / 2);
        break;
      }
      at += shot.seconds;
    }
    await browser.evaluate(`window.__setFrame(${Math.round(at * fps)})`);
    // The poster is the set and the screen alone: captions belong to the moving picture.
    await browser.evaluate("document.querySelectorAll('.caption').forEach((c) => { c.style.opacity = '0'; }); true");
    writeFileSync(posterFile, await browser.screenshot("jpeg", 90));
    input.onProgress?.(1, "encoded");

    return { file: outFile, poster: posterFile, seconds, width, height, frames };
  } finally {
    try {
      ffmpeg?.kill();
    } catch {
      /* already exited */
    }
    await browser.close();
  }
}
