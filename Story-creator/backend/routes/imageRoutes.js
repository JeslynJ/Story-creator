const express = require("express");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

router.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "png");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*"
        },
        responseType: "arraybuffer"
      }
    );

    const base64Image = Buffer.from(response.data).toString("base64");

    res.json({ image: base64Image });

  } catch (error) {
    console.error("STABILITY ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

module.exports = router;
