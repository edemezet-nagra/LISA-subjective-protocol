# LISA (Local Impairment Scale Annotator)

A web-based application for conducting advanced image quality assessments. Originally based on the Double Stimulus Impairment Scale (DSIS), this tool has evolved into **LISA**, allowing subjects to view original and altered image pairs, rate the global quality degradation, and precisely annotate specific areas of local impairment using multi-masking.

## Features

- **LISA Protocol (V2)**: A highly interactive methodology for evaluating local and global impairments on processed images.
- **Generic Processing Engine**: The backend is completely agnostic. It can execute any script or binary (Node.js, Python, .exe) to process the images on the fly.
- **Annotation Tools**: Integrated canvas for masking/marking degraded areas with advanced tools (Brush, Eraser, Flood Fill, Zoom/Pan).
- **Training Mode**: A dedicated training phase to familiarize users with the tool without saving data.
- **Configurable Protocol**:
  - External configuration file (`protocol.config.js`).
  - Set specific execution arguments, license paths, and output directories.
- **Immersive Mode**:
  - Fullscreen support (Toggle with 'F').
  - Auto-hiding UI for a distraction-free viewing experience.
- **Data Persistence**:
  - Automatic saving of results to the local file system (JSON metadata + Mask images).
  - Organized folder structure for each candidate session.
- **Live Dashboard**: Real-time monitoring of results on the `/v2/results` route.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express (for local file operations and fast image processing)

## Demo Setup

This repository ships with a ready-to-run example so you can try LISA immediately:

- **Source images** – 10 images from the [DIV2K](https://data.vision.ee.ethz.ch/cvl/DIV2K/) dataset are included in the `image/` folder.
- **Processing script** – A small Node.js script (`compress.js`) applies JPEG compression via [sharp](https://sharp.pixelplumbing.com/). The default configuration compresses the images at quality **50** to simulate a visible degradation, but you can change this value in `protocol.config.js`.
- **Training images** – The example training pairs in `public/training/` use the same approach: each `train{i}_altered.png` is a JPEG quality **50** compression of its corresponding `train{i}_original.png`.

You can replace both the images and the processing script with your own to adapt LISA to any image quality experiment.

## Getting Started

### 1. Prerequisites

- Node.js installed.

### 2. Installation

```bash
npm install
```

### 3. Configuration

1. Copy the example configuration file:
   ```bash
   cp protocol.config_example.js protocol.config.js
   ```
2. Edit `protocol.config.js` to set your specific paths and preferences:
   - `resultsPath`: Path where candidates' annotations will be saved.
   - `executablePath`: Command to run for processing images. By default this is `node compress.js`, which applies JPEG compression using sharp. You can point it to any script or binary (Node.js, Python, .exe, etc.).
   - `args`: Arguments passed to the processing script (e.g. `['50']` for JPEG quality 50).

### 4. Running the Application

You need to run both the backend server and the frontend development server simultaneously.

**Start the Backend Server:**
```bash
npm run server
```
*Runs on http://localhost:3001*

**Start the Frontend:**
```bash
npm run dev
```
*Runs on http://localhost:8080 (or 8081 if port is busy)*

### 5. Usage

1. Open the application in your browser at `http://localhost:8080/v2` (the root `/` will automatically redirect you there).
2. **Training**: Click "Start Training" to practice with predefined images in `public/training/`.
3. **Protocol**: Enter candidate details and click "Start Session" to begin the actual assessment.
4. **Results**: View live progress and results at `http://localhost:8080/v2/results`.

## Project Structure

- `src/`: Frontend React application (LISA UI).
- `server.js`: Express server for API, file handling, and dynamic process execution.
- `compress.js`: Demo processing script — JPEG compression via sharp.
- `protocol.config.js`: Configuration file (ignored by Git).
- `image/`: Source folder for original test images (DIV2K samples).
- `processed/`: Output folder for dynamically processed images.
- `public/training/`: Folder containing fixed image pairs for the training phase.

## License

- **Code**: This project is licensed under the [MIT License](LICENSE).
- **Images & Assets**: Media files are used for demonstration/training and are **not** covered by the MIT license. They remain under their original licenses (CC0, Unsplash, Pixabay, etc.).
- **Attribution details**: See [CREDITS.md](CREDITS.md) for the complete, up-to-date list of sources, including assets used in `public/training/tools_tutorial.mp4`.
