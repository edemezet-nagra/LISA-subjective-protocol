// Copyright (c) 2026 Nagravision SARL
import sharp from "sharp";

const [inputPath, outputPath, ...rest] = process.argv.slice(2);
const quality = parseInt(rest[0], 10) || 80;

await sharp(inputPath).jpeg({ quality }).toFile(outputPath);
