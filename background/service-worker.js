// background/service-worker.js

import { summarizeText, analyzeScreenshot, generateTLDR } from "./ai-manager.js";

// This script will handle background tasks, such as
// managing context menus, and handling AI API calls.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize with Visua11y",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarize") {
    const summary = await summarizeText(info.selectionText);

    // Inject the content script to make sure it's loaded
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content/content-script.js"],
    });

    // Send the message to display the summary
    await chrome.tabs.sendMessage(tab.id, {
      action: "displaySummary",
      summary: summary,
    });
  }
});

// Handle messages from popup and other components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Service worker received message:", request.action);

  if (request.action === "analyzeScreenshot") {
    // Handle async operation properly
    (async () => {
      try {
        console.log("🖼️ Processing screenshot analysis request...");

        // Validate request
        if (!request.screenshot) {
          throw new Error("No screenshot data provided");
        }

        const analysis = await analyzeScreenshot(request.screenshot);
        console.log("✅ Analysis completed, sending response");
        sendResponse({ success: true, analysis: analysis });
      } catch (error) {
        console.error("❌ Screenshot analysis failed in service worker:", error);
        sendResponse({
          success: false,
          error: error.message || "Unknown error occurred during analysis",
        });
      }
    })();

    // Return true to keep the message channel open for async responses
    return true;
  }

  if (request.action === "generateTLDR") {
    // Handle async TLDR generation
    (async () => {
      try {
        console.log("📋 Processing TLDR generation request...");

        // Validate request
        if (!request.pageContent) {
          throw new Error("No page content provided");
        }

        const tldr = await generateTLDR(request.pageContent);
        console.log("✅ TLDR generated, sending response");
        sendResponse({ success: true, tldr: tldr });
      } catch (error) {
        console.error("❌ TLDR generation failed in service worker:", error);
        sendResponse({
          success: false,
          error: error.message || "Unknown error occurred during TLDR generation",
        });
      }
    })();

    // Return true to keep the message channel open for async responses
    return true;
  }

  // For unknown actions, send an error response
  console.warn("⚠️ Unknown action received:", request.action);
  sendResponse({ success: false, error: "Unknown action: " + request.action });
  return false;
});
