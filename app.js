const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const sharp = require("sharp");

const azureVision = require("@azure-rest/ai-vision-image-analysis");
const { AzureKeyCredential } = require("@azure/core-auth");

dotenv.config();
const app = express();
const upload = multer();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});


// Connect to Azure
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
    throw new Error("Cannot initialize Azure Image Analysis client");
}

// Helper function to validate image dimensions
async function validateImageDimensions(buffer) {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width < 50 || metadata.height < 50) {
        throw new Error("Image too small. Minimum size is 50px.");
    }
    if (metadata.width > 16000 || metadata.height > 16000) {
        throw new Error("Image too large. Maximum size is 16,000px.");
    }
    return metadata;
}

// Get image captions and details
app.post("/analyze", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });

        // Check dimensions
        await validateImageDimensions(req.file.buffer);

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

        res.json(result.body);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

// Post bounding box image
app.post("/analyze-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image uploaded" });

        // Validate dimensions
        const meta = await validateImageDimensions(req.file.buffer);

        const features = ["Objects", "DenseCaptions", "People"];

        const result = await client.path("/imageanalysis:analyze").post({
            body: req.file.buffer,
            queryParameters: { features },
            contentType: "application/octet-stream",
        });

        // Collect bounding boxes...
        const boxes = [];
        if (result.body.objects?.values?.length) {
            for (const obj of result.body.objects.values) {
                if (obj.boundingBox) {
                    boxes.push({ ...obj.boundingBox, label: obj.tags?.[0]?.name || "Object" });
                }
            }
        }

        if (result.body.denseCaptionsResult?.values?.length) {
            for (const cap of result.body.denseCaptionsResult.values) {
                if (cap.boundingBox) boxes.push({ ...cap.boundingBox, label: cap.text });
            }
        }

        if (result.body.peopleResult?.values?.length) {
            for (const person of result.body.peopleResult.values) {
                if (person.boundingBox) boxes.push({ ...person.boundingBox, label: "Person" });
            }
        }

        if (!boxes.length) {
            console.log("No bounding boxes detected");
            res.set("Content-Type", "image/jpeg");
            return res.send(req.file.buffer);
        }

        // Draw boxes
        let svg = `<svg width="${meta.width}" height="${meta.height}">`;
        for (const box of boxes) {
            const { x, y, w, h, label } = box;
            svg += `
                <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="red" stroke-width="2"/>
                <text x="${x}" y="${y - 3}" fill="red" font-size="16" font-weight="bold">${label}</text>
            `;
        }
        svg += "</svg>";

        const output = await sharp(req.file.buffer)
            .composite([{ input: Buffer.from(svg), blend: "over" }])
            .toBuffer();

        res.set("Content-Type", "image/png");
        res.send(output);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
