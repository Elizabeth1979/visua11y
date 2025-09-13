// popup/popup.js

console.log("Visua11y popup script loaded.");

function validateOpenAIApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  // Basic validation for OpenAI API key format
  // OpenAI API keys start with "sk-" and are typically 51+ characters long
  const isValidFormat = /^sk-[A-Za-z0-9_-]{48,}$/.test(apiKey);

  return isValidFormat;
}

function validateGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") return false;
  // Typical Google API keys start with AIza and are ~39 chars total
  // Use a permissive check to avoid false negatives across accounts
  return /^AIza[0-9A-Za-z_\-]{20,}$/.test(apiKey);
}

// Simple function to clean up AI-generated HTML
function cleanAnalysisHTML(html) {
  if (!html) return "<p>No analysis available.</p>";

  // Clean up formatting to be simple and readable
  return (
    html
      // Remove bold markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      // Convert headers to simple text with bullet points
      .replace(/###\s*([^\n]+)/g, "• $1")
      .replace(/##\s*([^\n]+)/g, "• $1")
      .replace(/#\s*([^\n]+)/g, "• $1")
      // Clean up excessive line breaks
      .replace(/\n\n\n+/g, "\n\n")
      // Convert to simple paragraphs
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, " ")}</p>`)
      .join("")
  );
}

// Screenshot analysis functions
async function captureScreenshot() {
  try {
    console.log("📸 Capturing screenshot...");

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if tab exists and has a valid ID
    if (!tab || !tab.id || tab.id === -1) {
      throw new Error("No active tab found");
    }

    // Capture the visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
      quality: 90,
    });

    console.log("✅ Screenshot captured successfully");
    return dataUrl;
  } catch (error) {
    console.error("❌ Error capturing screenshot:", error);
    throw error;
  }
}

async function analyzeScreenshot(dataUrl) {
  try {
    console.log("🤖 Analyzing screenshot with AI...");

    // Send message to service worker to analyze the screenshot
    const response = await chrome.runtime.sendMessage({
      action: "analyzeScreenshot",
      screenshot: dataUrl,
    });

    console.log("📨 Received response from service worker:", response);

    // Check if response exists and has the expected structure
    if (!response) {
      throw new Error(
        "No response received from service worker. The extension may need to be reloaded."
      );
    }

    if (response.success) {
      console.log("✅ Screenshot analysis completed");
      return response.analysis;
    } else {
      throw new Error(response.error || "Analysis failed");
    }
  } catch (error) {
    console.error("❌ Error analyzing screenshot:", error);

    // Provide more specific error messages
    if (error.message.includes("Extension context invalidated")) {
      throw new Error("Extension needs to be reloaded. Please refresh the page and try again.");
    } else if (error.message.includes("Could not establish connection")) {
      throw new Error(
        "Cannot connect to extension background script. Please reload the extension."
      );
    }

    throw error;
  }
}

// TLDR generation functions using scripting injection (no debugger permission)
async function getPageContent() {
  try {
    console.log("📄 Getting page content using chrome.scripting...");

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if tab exists and has a valid ID
    if (!tab || !tab.id || tab.id === -1) {
      throw new Error("No active tab found");
    }

    // Inject a function to extract the content directly from the page context
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        try {
          const title = document.title || "";
          const url = window.location.href || "";
          const bodyText = document.body?.innerText || document.body?.textContent || "";
          const textContent = bodyText.length > 8000 ? bodyText.substring(0, 8000) + "..." : bodyText;
          const metaDesc = document.querySelector('meta[name="description"]');
          const ogDesc = document.querySelector('meta[property="og:description"]');
          const description = metaDesc?.content || ogDesc?.content || "";
          return { title, url, textContent, description };
        } catch (e) {
          return { title: "", url: "", textContent: "", description: "" };
        }
      },
    });

    if (!result) {
      throw new Error("Failed to extract page content");
    }

    console.log("✅ Page content extracted successfully");
    console.log("📊 Content length:", result.textContent.length);
    return result;
  } catch (error) {
    console.error("❌ Error getting page content:", error);
    throw error;
  }
}

async function generateTLDRSummary(pageContent) {
  try {
    console.log("🤖 Generating TLDR...");

    // Format content for AI analysis
    const formattedContent = `
Title: ${pageContent.title}

URL: ${pageContent.url}

${pageContent.description ? `Description: ${pageContent.description}` : ""}

Page Content: ${pageContent.textContent}
    `.trim();

    // Send message to service worker to generate TLDR
    const response = await chrome.runtime.sendMessage({
      action: "generateTLDR",
      pageContent: formattedContent,
    });

    console.log("📨 Received TLDR response from service worker:", response);

    // Check if response exists and has the expected structure
    if (!response) {
      throw new Error(
        "No response received from service worker. The extension may need to be reloaded."
      );
    }

    if (response.success) {
      console.log("✅ TLDR generation completed");
      return response.tldr;
    } else {
      throw new Error(response.error || "TLDR generation failed");
    }
  } catch (error) {
    console.error("❌ Error generating TLDR:", error);

    // Provide more specific error messages
    if (error.message.includes("Extension context invalidated")) {
      throw new Error("Extension needs to be reloaded. Please refresh the page and try again.");
    } else if (error.message.includes("Could not establish connection")) {
      throw new Error(
        "Cannot connect to extension background script. Please reload the extension."
      );
    }

    throw error;
  }
}

async function handleTLDRGeneration() {
  const tldrBtn = document.getElementById("tldr-btn");
  const statusDiv = document.getElementById("tldr-status");
  const resultDiv = document.getElementById("tldr-result");

  // Add null checks for all DOM elements
  if (!tldrBtn || !statusDiv || !resultDiv) {
    console.error("❌ Required TLDR DOM elements not found");
    return;
  }

  try {
    // Disable button and show loading state
    tldrBtn.disabled = true;
    tldrBtn.textContent = "📋 Generating...";
    statusDiv.textContent = "📄 Extracting page content...";
    statusDiv.className = "status-message loading";
    resultDiv.classList.remove("visible");

    // Get page content
    const pageContent = await getPageContent();

    statusDiv.textContent = "🤖 Generating TLDR with AI...";

    // Generate TLDR
    const tldr = await generateTLDRSummary(pageContent);

    // Show results
    statusDiv.textContent = "✅ TLDR generated!";
    statusDiv.className = "status-message success";

    // Clean up the AI-generated content
    const cleanedTLDR = cleanAnalysisHTML(tldr);

    resultDiv.innerHTML = `
      <h4>📋 TLDR - What's This Page About?</h4>
      <div class="analysis-content">${cleanedTLDR}</div>
    `;
    resultDiv.classList.add("visible");
  } catch (error) {
    console.error("❌ TLDR generation failed:", error);
    statusDiv.textContent = `❌ TLDR failed: ${error.message}`;
    statusDiv.className = "status-message error";
    resultDiv.classList.remove("visible");
  } finally {
    // Re-enable button
    tldrBtn.disabled = false;
    tldrBtn.textContent = "📋 Get TLDR";
  }
}

async function handleScreenshotAnalysis() {
  const analyzeBtn = document.getElementById("analyze-page-btn");
  const statusDiv = document.getElementById("analysis-status");
  const resultDiv = document.getElementById("analysis-result");
  const screenshotDiv = document.getElementById("screenshot-display");

  // Add null checks for all DOM elements
  if (!analyzeBtn || !statusDiv || !resultDiv || !screenshotDiv) {
    console.error("❌ Required DOM elements not found");
    return;
  }

  try {
    // Disable button and show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "📸 Analyzing...";
    statusDiv.textContent = "📸 Capturing screenshot...";
    statusDiv.className = "status-message loading";
    resultDiv.classList.remove("visible");
    screenshotDiv.classList.remove("visible");

    // Capture screenshot
    const screenshot = await captureScreenshot();

    statusDiv.textContent = "🤖 Analyzing page layout with AI...";

    // Analyze screenshot
    const analysis = await analyzeScreenshot(screenshot);

    // Show results
    statusDiv.textContent = "✅ Analysis completed!";
    statusDiv.className = "status-message success";

    // Clean up the AI-generated HTML (minimal processing needed)
    const cleanedAnalysis = cleanAnalysisHTML(analysis);

    resultDiv.innerHTML = `
      <h4>📊 Page Layout Analysis</h4>
      <div class="analysis-content">${cleanedAnalysis}</div>
    `;
    resultDiv.classList.add("visible");

    // Display screenshot
    screenshotDiv.innerHTML = `
      <div class="screenshot-info">
        <span>📸 Screenshot used for analysis:</span>
        <a href="${screenshot}" download="page-screenshot.png" class="screenshot-link">Download Screenshot</a>
      </div>
      <img src="${screenshot}" alt="Screenshot of analyzed webpage" />
    `;
    screenshotDiv.classList.add("visible");
  } catch (error) {
    console.error("❌ Screenshot analysis failed:", error);
    statusDiv.textContent = `❌ Analysis failed: ${error.message}`;
    statusDiv.className = "status-message error";
    resultDiv.classList.remove("visible");
    screenshotDiv.classList.remove("visible");
  } finally {
    // Re-enable button
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "📸 Analyze Current Page";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Add null checks for all DOM elements
  const statusDiv = document.getElementById("ai-status");
  const openaiApiKeyInput = document.getElementById("openai-api-key-input");
  const saveOpenAIButton = document.getElementById("save-openai-key");
  const clearOpenAIButton = document.getElementById("clear-openai-key");
  const openaiStatusDiv = document.getElementById("openai-api-key-status");
  const geminiApiKeyInput = document.getElementById("gemini-api-key-input");
  const saveGeminiButton = document.getElementById("save-gemini-key");
  const clearGeminiButton = document.getElementById("clear-gemini-key");
  const geminiStatusDiv = document.getElementById("gemini-api-key-status");
  const analyzePageBtn = document.getElementById("analyze-page-btn");

  // Check if required elements exist
  if (!statusDiv) {
    console.error("❌ ai-status element not found");
    return;
  }

  // Simple status display
  statusDiv.textContent = "✅ AI service ready!";
  statusDiv.style.color = "green";
  statusDiv.style.fontWeight = "bold";

  // Load existing API key status
  try {
    const result = await chrome.storage.local.get(["openaiApiKey", "geminiApiKey"]);

    // Check OpenAI API key - only if elements exist
    if (result.openaiApiKey && openaiApiKeyInput && openaiStatusDiv) {
      openaiApiKeyInput.value = "••••••••••••••••"; // Show masked key
      openaiStatusDiv.textContent = "✅ OpenAI API key configured";
      openaiStatusDiv.style.color = "green";
    } else if (openaiStatusDiv) {
      openaiStatusDiv.textContent = "ℹ️ No OpenAI API key set";
      openaiStatusDiv.style.color = "#666";
    }

    // Check Gemini API key - only if elements exist
    if (result.geminiApiKey && geminiApiKeyInput && geminiStatusDiv) {
      geminiApiKeyInput.value = "••••••••••••••••";
      geminiStatusDiv.textContent = "✅ Gemini API key configured";
      geminiStatusDiv.style.color = "green";
    } else if (geminiStatusDiv) {
      geminiStatusDiv.textContent = "ℹ️ No Gemini API key set";
      geminiStatusDiv.style.color = "#666";
    }
  } catch (e) {
    console.error("Error loading API key:", e);
  }

  // Screenshot analysis event listener - only if element exists
  if (analyzePageBtn) {
    analyzePageBtn.addEventListener("click", handleScreenshotAnalysis);
  }

  // TLDR generation event listener
  const tldrBtn = document.getElementById("tldr-btn");
  if (tldrBtn) {
    tldrBtn.addEventListener("click", handleTLDRGeneration);
  }

  // Save OpenAI API key - only if elements exist
  if (saveOpenAIButton && openaiApiKeyInput && openaiStatusDiv) {
    saveOpenAIButton.addEventListener("click", async () => {
      const apiKey = openaiApiKeyInput.value.trim();
      if (apiKey && apiKey !== "••••••••••••••••") {
        // Validate API key format
        if (!validateOpenAIApiKey(apiKey)) {
          openaiStatusDiv.textContent =
            "❌ Invalid OpenAI API key format (should start with 'sk-')";
          openaiStatusDiv.style.color = "red";
          return;
        }

        try {
          await chrome.storage.local.set({ openaiApiKey: apiKey });
          openaiApiKeyInput.value = "••••••••••••••••";
          openaiStatusDiv.textContent = "✅ OpenAI API key saved securely!";
          openaiStatusDiv.style.color = "green";
        } catch (e) {
          console.error("Error saving OpenAI API key:", e);
          openaiStatusDiv.textContent = "❌ Error saving OpenAI API key";
          openaiStatusDiv.style.color = "red";
        }
      } else {
        openaiStatusDiv.textContent = "⚠️ Please enter a valid OpenAI API key";
        openaiStatusDiv.style.color = "orange";
      }
    });
  }

  // Clear OpenAI API key - only if elements exist
  if (clearOpenAIButton && openaiApiKeyInput && openaiStatusDiv) {
    clearOpenAIButton.addEventListener("click", async () => {
      try {
        await chrome.storage.local.remove(["openaiApiKey"]);
        openaiApiKeyInput.value = "";
        openaiStatusDiv.textContent = "🗑️ OpenAI API key cleared";
        openaiStatusDiv.style.color = "#666";
      } catch (e) {
        console.error("Error clearing OpenAI API key:", e);
        openaiStatusDiv.textContent = "❌ Error clearing OpenAI API key";
        openaiStatusDiv.style.color = "red";
      }
    });
  }

  // Save Gemini API key - only if elements exist
  if (saveGeminiButton && geminiApiKeyInput && geminiStatusDiv) {
    saveGeminiButton.addEventListener("click", async () => {
      const apiKey = geminiApiKeyInput.value.trim();
      if (apiKey && apiKey !== "••••••••••••••••") {
        if (!validateGeminiApiKey(apiKey)) {
          geminiStatusDiv.textContent =
            "❌ Invalid Gemini API key format (should start with 'AIza')";
            geminiStatusDiv.style.color = "red";
          return;
        }

        try {
          await chrome.storage.local.set({ geminiApiKey: apiKey });
          geminiApiKeyInput.value = "••••••••••••••••";
          geminiStatusDiv.textContent = "✅ Gemini API key saved securely!";
          geminiStatusDiv.style.color = "green";
        } catch (e) {
          console.error("Error saving Gemini API key:", e);
          geminiStatusDiv.textContent = "❌ Error saving Gemini API key";
          geminiStatusDiv.style.color = "red";
        }
      } else {
        geminiStatusDiv.textContent = "⚠️ Please enter a valid Gemini API key";
        geminiStatusDiv.style.color = "orange";
      }
    });
  }

  // Clear Gemini API key - only if elements exist
  if (clearGeminiButton && geminiApiKeyInput && geminiStatusDiv) {
    clearGeminiButton.addEventListener("click", async () => {
      try {
        await chrome.storage.local.remove(["geminiApiKey"]);
        geminiApiKeyInput.value = "";
        geminiStatusDiv.textContent = "🗑️ Gemini API key cleared";
        geminiStatusDiv.style.color = "#666";
      } catch (e) {
        console.error("Error clearing Gemini API key:", e);
        geminiStatusDiv.textContent = "❌ Error clearing Gemini API key";
        geminiStatusDiv.style.color = "red";
      }
    });
  }
});
