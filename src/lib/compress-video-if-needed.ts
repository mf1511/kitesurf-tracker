import { MAX_VIDEO_BYTES, VIDEO_COMPRESS_TARGET_BYTES } from "@/lib/videos";
/** Au-delà, le WASM risque de saturer la RAM du navigateur */
const BROWSER_MAX_INPUT = Math.floor(1.5 * 1024 * 1024 * 1024);
const CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

export type CompressProgress = {
  phase: "load" | "compress";
  progress: number;
};

type FfmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;

let ffmpegReady: Promise<FfmpegInstance> | null = null;

async function loadFfmpeg(
  onProgress?: (p: CompressProgress) => void
): Promise<FfmpegInstance> {
  if (ffmpegReady) return ffmpegReady;
  ffmpegReady = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    onProgress?.({ phase: "load", progress: 0 });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    onProgress?.({ phase: "load", progress: 1 });
    return ffmpeg;
  })();
  try {
    return await ffmpegReady;
  } catch (err) {
    ffmpegReady = null;
    throw err;
  }
}

function probeDurationSec(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    const done = (sec: number) => {
      URL.revokeObjectURL(url);
      resolve(sec);
    };
    video.onloadedmetadata = () => {
      const d = video.duration;
      done(Number.isFinite(d) && d > 0 ? d : 60);
    };
    video.onerror = () => done(60);
    video.src = url;
  });
}

function outFileName(name: string): string {
  return name.replace(/\.[^.]+$/, "") + ".mp4";
}

/** Compresse dans le navigateur dès que le fichier dépasse la cible catalogue */
export async function compressVideoIfNeeded(
  file: File,
  onProgress?: (p: CompressProgress) => void
): Promise<File> {
  if (file.size <= VIDEO_COMPRESS_TARGET_BYTES) return file;
  if (file.size > BROWSER_MAX_INPUT) {
    throw new Error("Fichier trop lourd pour compresser ici (max 1,5 Go)");
  }

  const { fetchFile } = await import("@ffmpeg/util");
  let ffmpeg: FfmpegInstance;
  try {
    ffmpeg = await loadFfmpeg(onProgress);
  } catch {
    throw new Error("Impossible de charger le compresseur (réseau)");
  }

  const duration = await probeDurationSec(file);
  const fitKbps = Math.floor((VIDEO_COMPRESS_TARGET_BYTES * 8) / duration / 1000) - 96;
  const videoKbps = Math.max(80, Math.min(2500, fitKbps));

  await ffmpeg.writeFile("in.bin", await fetchFile(file));

  const passes: string[][] = [
    ["-vf", "scale='min(1280,iw)':-2", "-b:v", `${videoKbps}k`, "-maxrate", `${videoKbps}k`, "-bufsize", `${videoKbps * 2}k`, "-c:a", "aac", "-b:a", "96k"],
    ["-vf", "scale='min(960,iw)':-2", "-b:v", `${Math.max(80, Math.floor(videoKbps * 0.7))}k`, "-maxrate", `${Math.max(80, Math.floor(videoKbps * 0.7))}k`, "-bufsize", `${Math.max(160, videoKbps)}k`, "-c:a", "aac", "-b:a", "64k"],
    ["-vf", "scale='min(854,iw)':-2", "-crf", "30", "-c:a", "aac", "-b:a", "64k"],
    ["-vf", "scale='min(640,iw)':-2", "-crf", "34", "-c:a", "aac", "-b:a", "48k"],
    ["-vf", "scale='min(640,iw)':-2", "-b:v", `${Math.max(60, fitKbps - 40)}k`, "-maxrate", `${Math.max(60, fitKbps - 40)}k`, "-bufsize", `${Math.max(120, (fitKbps - 40) * 2)}k`, "-c:a", "aac", "-b:a", "48k"],
  ];

  let last: File | null = null;
  try {
    for (let i = 0; i < passes.length; i++) {
      const handler = ({ progress }: { progress: number }) => {
        onProgress?.({
          phase: "compress",
          progress: (i + Math.min(1, Math.max(0, progress))) / passes.length,
        });
      };
      ffmpeg.on("progress", handler);
      const code = await ffmpeg.exec([
        "-y",
        "-i",
        "in.bin",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-movflags",
        "+faststart",
        "-threads",
        "1",
        ...passes[i],
        "out.mp4",
      ]);
      ffmpeg.off("progress", handler);
      if (code !== 0) throw new Error("Compression ffmpeg échouée");

      const data = await ffmpeg.readFile("out.mp4");
      await ffmpeg.deleteFile("out.mp4").catch(() => {});
      if (typeof data === "string") throw new Error("Compression : sortie invalide");
      last = new File([new Uint8Array(data)], outFileName(file.name), {
        type: "video/mp4",
      });
      if (last.size <= VIDEO_COMPRESS_TARGET_BYTES) return last;
    }
  } finally {
    await ffmpeg.deleteFile("in.bin").catch(() => {});
    await ffmpeg.deleteFile("out.mp4").catch(() => {});
  }

  if (last && last.size <= MAX_VIDEO_BYTES) return last;
  throw new Error(
    last
      ? `Toujours trop gros après compression (${(last.size / (1024 * 1024)).toFixed(1)} Mo)`
      : "Compression échouée"
  );
}
