// background/ai-manager.js

// This module handles Chrome Built-in AI, OpenAI API, and Gemini API

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_TEXT_MODEL = "models/gemini-1.5-flash-latest"; // text-only
const GEMINI_VISION_MODEL = "models/gemini-1.5-flash-latest"; // multimodal

export async function summarizeText(text) {
  console.log("🤖 Starting AI summarization process...");
  console.log("📊 Input text length:", text.length);

  // Try Chrome Built-in AI first
  try {
    console.log("🔍 Checking Chrome Built-in AI...");
    if (await isBuiltInAIAvailable()) {
      console.log("✅ Chrome Built-in AI is available, attempting summarization...");
      const builtInResult = await summarizeWithBuiltInAI(text);
      if (builtInResult) {
        return builtInResult;
      }
    } else {
      console.log("❌ Chrome Built-in AI not available");
    }
  } catch (error) {
    console.error("❌ Chrome Built-in AI failed:", error);
  }

  // Try OpenAI API second
  try {
    console.log("🔍 Checking OpenAI API...");
    const openaiApiKey = await getOpenAIApiKey();
    if (!openaiApiKey) {
      console.error("❌ No valid OpenAI API key found");
      console.log("💡 To use OpenAI API:");
      console.log("  1. Get an API key from https://platform.openai.com/api-keys");
      console.log("  2. Add it via the extension popup (stored locally)");
    } else {
      console.log("✅ OpenAI API key found, attempting OpenAI API summarization...");
      const openaiResult = await summarizeWithOpenAIAPI(text);
      if (openaiResult) {
        return openaiResult;
      }
    }
  } catch (error) {
    console.error("❌ OpenAI API failed:", error);
    console.error("Stack trace:", error.stack);
  }

  // Try Gemini API third
  try {
    console.log("🔍 Checking Gemini API...");
    const geminiKey = await getGeminiApiKey();
    if (!geminiKey) {
      console.log("ℹ️ No Gemini key configured");
    } else {
      console.log("✅ Gemini API key found, attempting Gemini summarization...");
      const geminiResult = await summarizeWithGeminiAPI(text);
      if (geminiResult) {
        return geminiResult;
      }
    }
  } catch (error) {
    console.error("❌ Gemini API failed:", error);
  }

  // No AI available - return error message instead of fallback
  console.error("❌ All AI methods failed - no summarization available");
  return "🚫 AI Summary: Unable to generate summary. Configure an OpenAI or Gemini API key in the extension popup, or enable Chrome Built-in AI.";
}

async function isBuiltInAIAvailable() {
  console.log("🔍 Checking if self.ai exists:", typeof self.ai !== "undefined");

  if (typeof self.ai === "undefined") {
    console.log("❌ self.ai not available - Chrome Built-in AI not supported");
    return false;
  }

  console.log("🔍 Checking if self.ai.summarizer exists:", !!self.ai?.summarizer);

  if (!self.ai?.summarizer) {
    console.log("❌ self.ai.summarizer not available");
    return false;
  }

  try {
    console.log("🔍 Getting summarizer capabilities...");
    const capabilities = await self.ai.summarizer.capabilities();
    console.log("📊 Summarizer capabilities:", capabilities);

    const isAvailable = capabilities.available !== "no";
    console.log("✅ Built-in AI available:", isAvailable);

    if (!isAvailable) {
      console.log("💡 Chrome Built-in AI is not available. This could mean:");
      console.log("  1. You need Chrome 127+ with AI features enabled");
      console.log("  2. Visit chrome://flags/#optimization-guide-on-device-model");
      console.log("  3. Enable 'Enables optimization guide on device'");
      console.log("  4. Visit chrome://flags/#summarization-api-for-gemini-nano");
      console.log("  5. Enable 'Summarization API for Gemini Nano'");
    }

    return isAvailable;
  } catch (error) {
    console.error("❌ Error checking capabilities:", error);
    return false;
  }
}

async function summarizeWithBuiltInAI(text) {
  console.log("🤖 Creating summarizer with Chrome Built-in AI...");

  let summarizer;
  try {
    summarizer = await self.ai.summarizer.create({
      sharedContext:
        "You are helping users with cognitive disabilities understand complex text by simplifying it according to WCAG 3.1.5 accessibility standards.",
    });

    console.log("📝 Summarizer created, starting summarization...");
    const result = await summarizer.summarize(text);

    console.log("✅ Chrome Built-in AI summary generated successfully");
    console.log("📝 Summary length:", result.length);

    return `🤖 AI Summary: ${result}`;
  } catch (error) {
    console.error("❌ Chrome Built-in AI summarization failed:", error);
    throw error;
  } finally {
    if (summarizer) {
      try {
        summarizer.destroy();
        console.log("🗑️ Summarizer cleaned up");
      } catch (cleanupError) {
        console.warn("⚠️ Error cleaning up summarizer:", cleanupError);
      }
    }
  }
}

async function summarizeWithOpenAIAPI(text) {
  const apiKey = await getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("No valid OpenAI API key available");
  }

  console.log("🌐 Making OpenAI API request...");
  console.log("📊 Request text length:", text.length);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Your task is to simplify complex information for users with cognitive disabilities, as per accessibility standard WCAG 3.1.5 (Reading Level). Create a version of the following text that is easy to understand, as if for someone at a lower secondary education level. The summary should be concise and clear. Use **bold text** to highlight important terms and concepts.`,
          },
          {
            role: "user",
            content: `Please summarize the following text:\n\n${text}`,
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    console.log("📡 OpenAI API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      console.error("❌ OpenAI API HTTP error:", response.status, errorMessage);

      if (response.status === 401) {
        console.log("💡 API key might be invalid or expired");
      } else if (response.status === 403) {
        console.log("💡 API key might not have permission");
      } else if (response.status === 429) {
        console.log("💡 Rate limit exceeded, try again later");
      }

      throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    console.log("📦 OpenAI API response received");

    if (data.choices?.[0]?.message?.content) {
      const summary = data.choices[0].message.content.trim();
      console.log("✅ OpenAI AI summary generated successfully");
      console.log("📝 Summary length:", summary.length);
      return `🤖 AI Summary: ${summary}`;
    }

    if (data.error) {
      console.error("❌ OpenAI API returned error:", data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    console.error("❌ Unexpected OpenAI API response format:", data);
    throw new Error("Unexpected response format from OpenAI API");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.error("❌ Network error calling OpenAI API:", error.message);
      throw new Error("Network error: Unable to reach OpenAI API. Check your internet connection.");
    }
    throw error;
  }
}

async function summarizeWithGeminiAPI(text) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) throw new Error("No valid Gemini API key available");

  console.log("🌐 Making Gemini API request...");
  console.log("📊 Request text length:", text.length);

  const url = `${GEMINI_API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Your task is to simplify complex information for users with cognitive disabilities (WCAG 3.1.5). Keep it concise and highlight important words in bold Markdown.\n\n" +
                  `Please summarize the following text:\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    console.log("📡 Gemini API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || response.statusText;
      throw new Error(`Gemini API error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    // Expected structure: candidates[0].content.parts[0].text
    const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (textOut) {
      return `🤖 AI Summary: ${textOut}`;
    }
    throw new Error("Unexpected response format from Gemini API");
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to reach Gemini API.");
    }
    throw error;
  }
}

async function getOpenAIApiKey() {
  try {
    console.log("🔍 Checking for OpenAI API key in Chrome storage...");
    // User-provided via popup; no file-based config to avoid shipping secrets
    const result = await chrome.storage.local.get(["openaiApiKey"]);
    if (result.openaiApiKey) {
      console.log("📋 Found OpenAI API key in storage, validating format...");
      if (isValidOpenAIApiKey(result.openaiApiKey)) {
        console.log("✅ Valid OpenAI API key found in Chrome storage");
        return result.openaiApiKey;
      } else {
        console.log("❌ Invalid OpenAI API key format in Chrome storage");
      }
    } else {
      console.log("❌ No OpenAI API key found in Chrome storage");
    }

    console.log("❌ No valid OpenAI API key available");
    return null;
  } catch (error) {
    console.error("❌ Error getting OpenAI API key:", error);
    return null;
  }
}

function isValidOpenAIApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  // Basic validation for OpenAI API key format
  const isValidFormat = /^sk-[A-Za-z0-9_-]{48,}$/.test(apiKey);

  return isValidFormat;
}

// Gemini API key helpers (optional provider)
async function getGeminiApiKey() {
  try {
    const result = await chrome.storage.local.get(["geminiApiKey"]);
    if (result.geminiApiKey && isValidGeminiApiKey(result.geminiApiKey)) {
      return result.geminiApiKey;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting Gemini API key:", error);
    return null;
  }
}

function isValidGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") return false;
  // Typical Google API keys start with AIza and are ~39 chars total
  return /^AIza[0-9A-Za-z_\-]{20,}$/.test(apiKey);
}

// New function for generating TLDR summary of page content
export async function generateTLDR(pageContent) {
  console.log("🤖 Starting TLDR generation...");
  console.log("📊 Page content length:", pageContent.length);

  try {
    // Prefer OpenAI if configured, else fall back to Gemini
    const openaiApiKey = await getOpenAIApiKey();
    if (openaiApiKey) {
      console.log("🌐 Making OpenAI API request for TLDR...");
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an accessibility expert helping users with cognitive disabilities understand webpage content. Create a TLDR that explains the page in simple, clear language. Use **bold** for important terms.",
            },
            { role: "user", content: `Provide a TLDR for:\n\n${pageContent}` },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      console.log("📡 OpenAI TLDR API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      console.log("📦 OpenAI TLDR API response received");
      const tldr = data?.choices?.[0]?.message?.content?.trim();
      if (tldr) return tldr;
      throw new Error("No TLDR content received from OpenAI API");
    }

    const geminiApiKey = await getGeminiApiKey();
    if (geminiApiKey) {
      console.log("🌐 Making Gemini API request for TLDR...");
      const url = `${GEMINI_API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are an accessibility expert helping users with cognitive disabilities. Create a short TLDR that explains what this page is about in simple, clear language. Use **bold** for key terms.\n\n" +
                    pageContent,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
        }),
      });

      console.log("📡 Gemini TLDR API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || response.statusText;
        throw new Error(`Gemini API error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      console.log("📦 Gemini TLDR API response received");
      const tldr = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (tldr) return tldr;
      throw new Error("No TLDR content received from Gemini API");
    }

    throw new Error(
      "No valid API key found. Configure an OpenAI or Gemini API key in the extension popup."
    );
  } catch (error) {
    console.error("❌ TLDR generation failed:", error);
    throw error;
  }
}

// New function for screenshot analysis using OpenAI Vision API
export async function analyzeScreenshot(screenshotDataUrl) {
  console.log("🤖 Starting screenshot analysis...");

  try {
    const openaiApiKey = await getOpenAIApiKey();
    if (openaiApiKey) {
      console.log("🌐 Making OpenAI Vision API request...");
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // supports vision
          messages: [
            {
              role: "system",
              content:
                "You are an accessibility expert analyzing webpage screenshots. Provide concise visual summaries for screen reader users, focusing on structure and key interactive elements.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this webpage screenshot." },
                { type: "image_url", image_url: { url: screenshotDataUrl, detail: "high" } },
              ],
            },
          ],
          max_tokens: 400,
          temperature: 0.1,
        }),
      });

      console.log("📡 OpenAI Vision API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      console.log("📦 OpenAI Vision API response received");
      const analysis = data?.choices?.[0]?.message?.content?.trim();
      if (analysis) return analysis;
      throw new Error("No analysis content received from OpenAI Vision API");
    }

    const geminiApiKey = await getGeminiApiKey();
    if (geminiApiKey) {
      console.log("🌐 Making Gemini Vision API request...");
      const { base64, mime } = extractBase64FromDataUrl(screenshotDataUrl);
      const url = `${GEMINI_API_BASE}/${GEMINI_VISION_MODEL}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this webpage screenshot for structure and key interactive elements." },
                { inline_data: { mime_type: mime, data: base64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 400 },
        }),
      });

      console.log("📡 Gemini Vision API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || response.statusText;
        throw new Error(`Gemini API error (${response.status}): ${msg}`);
      }

      const data = await response.json();
      console.log("📦 Gemini Vision API response received");
      const analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (analysis) return analysis;
      throw new Error("No analysis content received from Gemini Vision API");
    }

    throw new Error(
      "No valid API key found. Configure an OpenAI or Gemini API key in the extension popup."
    );
  } catch (error) {
    console.error("❌ Screenshot analysis failed:", error);
    throw error;
  }
}

function extractBase64FromDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return { base64: "", mime: "image/png" };
  }
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return { base64: "", mime: "image/png" };
  return { mime: match[1] || "image/png", base64: match[2] || "" };
}
