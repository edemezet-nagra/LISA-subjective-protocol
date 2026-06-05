// Copyright (c) 2026 Nagravision SARL
import express from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import util from "util";
import protocolConfig from "./protocol.config.js";

const execPromise = util.promisify(exec);

const app = express();
const PORT = 3001;

// Per-session excludes for multi-client isolation
const sessionExcludes = new Map();

// Simple FIFO queue for embedder executions
let embedQueue = Promise.resolve();

function enqueueEmbedder(command) {
  embedQueue = embedQueue
    .then(() => execPromise(command))
    .catch((error) => {
      console.error("Embedder execution error:", error);
      throw error;
    });
  return embedQueue;
}

function getSessionKey(sessionId) {
  if (sessionId === undefined || sessionId === null) return null;
  return String(sessionId);
}

function getSessionExcludeSet(sessionId, resetSession = false) {
  const key = getSessionKey(sessionId);
  if (!key) return null;
  if (resetSession) {
    sessionExcludes.delete(key);
  }
  if (!sessionExcludes.has(key)) {
    sessionExcludes.set(key, new Set());
  }
  return sessionExcludes.get(key);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get results path from config or default to a local 'results' folder
const RESULTS_PATH =
  protocolConfig.resultsPath || path.join(__dirname, "results");

if (protocolConfig.resultsPath && !fs.existsSync(protocolConfig.resultsPath)) {
  console.error(
    `\x1b[31mError: The configured resultsPath does not exist:\x1b[0m ${protocolConfig.resultsPath}`,
  );
  console.error(
    "Please ensure the directory exists or update protocol.config.js",
  );
  process.exit(1);
}

console.log(`Saving results to: ${RESULTS_PATH}`);

// Serve static files with explicit CORS for images
const staticOptions = {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "*");
  },
};

app.use(
  "/images",
  express.static(path.join(__dirname, "image"), staticOptions),
);
app.use(
  "/processed",
  express.static(path.join(__dirname, "processed"), staticOptions),
);
app.use("/results", express.static(RESULTS_PATH, staticOptions));
app.use(
  "/training",
  express.static(path.join(__dirname, "public", "training"), staticOptions),
);

// Ensure processed directory exists
fs.ensureDirSync(path.join(__dirname, "processed"));

app.get("/api/training-pairs", (req, res) => {
  const trainingDir = path.join(__dirname, "public", "training");
  try {
    const files = fs.readdirSync(trainingDir);
    // Find all original images matching train{i}_original.png
    const originalPattern = /^train(\d+)_original\.png$/i;
    const indices = files
      .map((f) => {
        const m = f.match(originalPattern);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((i) => i !== null)
      .sort((a, b) => a - b);

    const pairs = indices
      .filter((i) =>
        files.some((f) => f.toLowerCase() === `train${i}_altered.png`),
      )
      .map((i) => ({
        id: `train${i}`,
        imageName: `Training Image ${i}`,
        originalUrl: `/training/train${i}_original.png`,
        alteredUrl: `/training/train${i}_altered.png`,
      }));

    res.json(pairs);
  } catch (e) {
    console.error("Error scanning training directory:", e);
    res.json([]);
  }
});

app.post("/api/process-image", async (req, res) => {
  try {
    const { exclude = [], sessionId, resetSession = false, noDuplicates = true } = req.body;
    const sessionExcludeSet = getSessionExcludeSet(sessionId, resetSession);
    const excludeSet = new Set(exclude);
    
    // Only merge session excludes if noDuplicates is requested
    if (noDuplicates && sessionExcludeSet) {
      sessionExcludeSet.forEach((item) => excludeSet.add(item));
    }
    
    const imageDir = path.join(__dirname, "image");
    const files = await fs.readdir(imageDir);
    let images = files.filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));

    // Filter out excluded images
    // We assume 'exclude' contains image names (without extension)
    if (excludeSet.size > 0) {
      images = images.filter((img) => !excludeSet.has(path.parse(img).name));
    }

    if (images.length === 0) {
      // If we filtered everything because of the exclude list
      if (excludeSet.size > 0 && files.length > 0) {
        if (sessionExcludeSet) {
          const key = getSessionKey(sessionId);
          if (key) sessionExcludes.delete(key);
        }
        return res.json({ completed: true });
      }
      return res.status(404).json({ error: "No images found" });
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];
    if (sessionExcludeSet) {
      sessionExcludeSet.add(path.parse(randomImage).name);
    }

    // Generate a unique ID for the response/frontend (not passed to the cmd anymore)
    const uniqueResponseId = Math.floor(Math.random() * 1000000);

    const inputPath = path.join(imageDir, randomImage);
    const outputFilename = `processed_${Date.now()}_${randomImage}`;
    const outputPath = path.join(__dirname, "processed", outputFilename);

    const extraArgs =
      protocolConfig.args && protocolConfig.args.length > 0
        ? protocolConfig.args.join(" ")
        : "";

    let resolvedExec = protocolConfig.executablePath;

    const isScriptCommand =
      resolvedExec.toLowerCase().startsWith("python") ||
      resolvedExec.toLowerCase().startsWith("node ");
    if (!isScriptCommand && !path.isAbsolute(resolvedExec)) {
      resolvedExec = `"${path.join(__dirname, resolvedExec)}"`;
    }

    if (resolvedExec.toLowerCase().startsWith("python")) {
      await fs.copy(inputPath, outputPath);
    }

    const command =
      `${resolvedExec} "${inputPath}" "${outputPath}" ${extraArgs}`.trim();

    console.log(`Executing process: ${command}`);
    await enqueueEmbedder(command);

    res.json({
      id: `${randomImage}-${uniqueResponseId}`,
      imageName: path.parse(randomImage).name,
      originalUrl: `/images/${randomImage}`,
      alteredUrl: `/processed/${outputFilename}`,
    });
  } catch (error) {
    console.error("Error generating pair:", error);
    res.status(500).json({ error: error.message });
  }
});

async function copyLocalFile(urlPath, destinationPath) {
  try {
    let sourcePath = null;

    // Handle potential full URLs or relative URLs
    let relativeUrl = urlPath;
    try {
      if (urlPath.startsWith("http")) {
        const urlObj = new URL(urlPath);
        relativeUrl = urlObj.pathname;
      }
    } catch (e) {
      // ignore invalid urls, treat as relative
    }

    // Decode URL formatting (space -> %20, etc)
    const fileName = decodeURIComponent(path.basename(relativeUrl));

    // Map URL paths to local file system paths
    if (relativeUrl.startsWith("/images/")) {
      sourcePath = path.join(__dirname, "image", fileName);
    } else if (relativeUrl.startsWith("/processed/")) {
      sourcePath = path.join(__dirname, "processed", fileName);
    } else if (relativeUrl.startsWith("/training/")) {
      sourcePath = path.join(__dirname, "training", fileName);
    }

    if (sourcePath) {
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destinationPath);
      } else {
        console.error(
          `Source file not found: ${sourcePath} (derived from ${urlPath})`,
        );
      }
    } else {
      console.error(`Could not map URL to local path: ${urlPath}`);
    }
  } catch (error) {
    console.error(`Error copying file from ${urlPath}:`, error);
  }
}

// Helper to save base64 image
async function saveBase64Image(base64Data, filepath) {
  try {
    const base64Image = base64Data.split(";base64,").pop();
    await fs.writeFile(filepath, base64Image, { encoding: "base64" });
  } catch (error) {
    console.error(`Error saving base64 image:`, error);
  }
}


app.post("/api/save-result-v2", async (req, res) => {
  try {
    const { result, userInfo, imagePair, sessionId } = req.body;

    if (!result || !userInfo || !imagePair) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Missing result, userInfo, or imagePair",
        });
    }

    // Skip saving for training images
    if (imagePair.originalUrl && imagePair.originalUrl.includes("/training/")) {
      console.log("Training session - skipping save (v2)");
      return res.json({ success: true, message: "Training session ignored" });
    }

    const userFolder =
      `${userInfo.candidateId}_${userInfo.firstName}_${userInfo.lastName}`.replace(
        /[^a-z0-9_-]/gi,
        "_",
      );
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const annotationFolder = `annotation_v2_${imagePair.id}_${timestamp}`;

    const targetDir = path.join(RESULTS_PATH, userFolder, annotationFolder);
    await fs.ensureDir(targetDir);

    if (result.maskData) {
      await saveBase64Image(result.maskData, path.join(targetDir, "mask.png"));
    }

    await copyLocalFile(
      imagePair.originalUrl,
      path.join(targetDir, "original.jpg"),
    );
    await copyLocalFile(
      imagePair.alteredUrl,
      path.join(targetDir, "altered.jpg"),
    );

    const metadata = {
      userInfo,
      result,
      imagePair,
      sessionId: sessionId || null,
      files: {
        mask: "mask.png",
        original: "original.jpg",
        altered: "altered.jpg",
      },
      savedAt: new Date().toISOString(),
    };

    await fs.writeJson(path.join(targetDir, "metadata.json"), metadata, {
      spaces: 2,
    });

    console.log(
      `Saved v2 result for ${userInfo.candidateId} - Image ${imagePair.id}`,
    );

    const relativePath = path.relative(
      RESULTS_PATH,
      path.join(targetDir, "mask.png"),
    );
    const urlPath = "/results/" + relativePath.split(path.sep).join("/");

    res.json({ success: true, path: targetDir, maskUrl: urlPath });
  } catch (error) {
    console.error("Error processing save-result-v2:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Returns all saved results (v1 - EDSIN) for a given user

// Returns all saved results (v2 - EMDSIN) for a given user
app.get("/api/user-results-v2", async (req, res) => {
  try {
    const { candidateId, firstName, lastName } = req.query;
    if (!candidateId || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const userFolder = `${candidateId}_${firstName}_${lastName}`.replace(
      /[^a-z0-9_-]/gi,
      "_",
    );
    const userDir = path.join(RESULTS_PATH, userFolder);

    if (!(await fs.pathExists(userDir))) {
      return res.json({ results: [] });
    }

    const entries = await fs.readdir(userDir);
    const results = [];

    for (const folder of entries) {
      if (!folder.startsWith("annotation_v2_")) continue;
      const metadataPath = path.join(userDir, folder, "metadata.json");
      if (await fs.pathExists(metadataPath)) {
        try {
          const metadata = await fs.readJson(metadataPath);
          const maskRelPath = path.relative(
            RESULTS_PATH,
            path.join(userDir, folder, "mask.png"),
          );
          const maskUrl = "/results/" + maskRelPath.split(path.sep).join("/");
          results.push({ ...metadata.result, maskUrl });
        } catch (e) {
          console.error(`Error reading metadata from ${metadataPath}:`, e);
        }
      }
    }

    console.log(
      `Loaded ${results.length} previous v2 results for user ${userFolder}`,
    );
    res.json({ results });
  } catch (error) {
    console.error("Error fetching user v2 results:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the built React app when dist/ exists (Electron / production mode)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all: serve index.html for any non-API route (React Router support)
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
