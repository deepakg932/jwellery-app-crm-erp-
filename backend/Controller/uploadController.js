import fs from "fs";
import path from "path";

export const uploadChunk = async (req, res) => {
  try {
    const { fileId, chunkIndex, totalChunks } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Chunk missing" });
    }

    const chunkDir = `uploads/tmp/${fileId}`;
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    fs.renameSync(req.file.path, `${chunkDir}/${chunkIndex}`);

    // 🔥 last chunk → merge
    if (Number(chunkIndex) + 1 === Number(totalChunks)) {
      const finalDir = "uploads/videos";
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      const finalPath = `${finalDir}/${fileId}.mp4`;
      const writeStream = fs.createWriteStream(finalPath);

      for (let i = 0; i < Number(totalChunks); i++) {
        const chunk = fs.readFileSync(`${chunkDir}/${i}`);
        writeStream.write(chunk);
      }

      writeStream.end();
      fs.rmSync(chunkDir, { recursive: true });

      return res.json({
        success: true,
        message: "Upload complete",
        videoUrl: `/uploads/videos/${fileId}.mp4`,
      });
    }

    return res.json({
      success: true,
      message: "Chunk uploaded",
      chunkIndex,
    });
  } catch (err) {
    console.error("Chunk Upload Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
