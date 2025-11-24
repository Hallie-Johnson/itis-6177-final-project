const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const dotenv = require("dotenv");
const fs = require("fs");
const azureVision = require("@azure-rest/ai-vision-image-analysis");
const { AzureKeyCredential } = require("@azure/core-auth");

dotenv.config();
const app = express();
const upload = multer();

let client;
if (typeof azureVision.ImageAnalysisClient === "function") {
    client = new azureVision.ImageAnalysisClient(
        process.env.AZURE_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_KEY)
    );
} else if (typeof azureVision.default === "function") {
    client = azureVision.default(
        process.env.AZURE_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_KEY)
    );
} else {
    throw new Error(
        "Cannot initialize Azure Image Analysis client"
    );
}

app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const features = [
            "Caption",
            "DenseCaptions",
            "Objects",
            "People",
            "Read",
            "SmartCrops",
            "Tags",
        ];

        const result = await client.path("/imageanalysis:analyze").post({
            body: req.file.buffer,
            queryParameters: { features },
            contentType: "application/octet-stream",
        });

        const body = result.body;
        const detections = body.objects?.list || [];

        const svgRects = detections.map(obj => {
            const { x, y, w, h } = obj.boundingBox;
            return `<rect x="${x}" y="${y}" width="${w}" height="${h}" 
                     fill="none" stroke="red" stroke-width="4"/>`;
        }).join("");

        const svg = `
            <svg width="${body.metadata.width}" height="${body.metadata.height}">
                ${svgRects}
            </svg>
        `;

        const outputImage = await sharp(req.file.buffer)
            .composite([{ input: Buffer.from(svg), blend: "over" }])
            .toBuffer();

        res.set("Content-Type", "image/png");
        res.send(outputImage);

    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({
            error: "Azure request failed",
            details: err.response?.data
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
