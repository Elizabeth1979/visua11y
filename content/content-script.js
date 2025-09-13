// content/content-script.js

// This script is injected into web pages and will be used
// to interact with the DOM, for example, to display summaries.

console.log("Visua11y content script loaded.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Content script received message:", request);
  if (request.action === "displaySummary") {
    console.log("📝 Displaying summary:", request.summary.substring(0, 50) + "...");
    displaySummary(request.summary);
    sendResponse({ success: true }); // Acknowledge receipt
  }
});

// Simple text formatter for better readability
function formatText(text) {
  // Remove AI Summary prefix if present to avoid duplicate formatting
  let content = text.replace(/^(🚀|🤖|📝)\s*AI Summary:\s*/i, "");

  // Apply basic formatting
  content = content
    // Bold text (**text**)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Italic text (*text*)
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Convert double line breaks to paragraph breaks
    .replace(/\n\n/g, "</p><p>")

    // Convert single line breaks to <br>
    .replace(/\n/g, "<br>");

  // Wrap in paragraph tags
  content = `<p>${content}</p>`;

  return content;
}

function displaySummary(text) {
  console.log("🎯 displaySummary called with text length:", text.length);

  const selection = window.getSelection();
  if (!selection.rangeCount) {
    console.log("❌ No text selection found");
    // Show summary anyway, but centered on screen
    showSummaryAtCenter(text);
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Remove existing summary box if any
  const existingBox = document.getElementById("visua11y-summary-box");
  if (existingBox) {
    console.log("🗑️ Removing existing summary box");
    existingBox.remove();
  }

  console.log("📦 Creating summary box at position:", {
    top: window.scrollY + rect.bottom + 10,
    left: window.scrollX + rect.left,
  });

  const summaryBox = document.createElement("div");
  summaryBox.id = "visua11y-summary-box";

  // Format text and add it to the summary box
  const formattedContent = formatText(text);
  summaryBox.innerHTML = `
    <div class="summary-content">${formattedContent}</div>
    <button id="visua11y-close-btn" class="btn btn-primary close-button">Close</button>
  `;

  summaryBox.style.position = "absolute";
  summaryBox.style.top = `${window.scrollY + rect.bottom + 10}px`;
  summaryBox.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(summaryBox);
  console.log("✅ Summary box added to page with formatted content");

  document.getElementById("visua11y-close-btn").addEventListener("click", () => {
    console.log("❌ Close button clicked");
    summaryBox.remove();
  });
}

function showSummaryAtCenter(text) {
  console.log("📦 Creating centered summary box");

  // Remove existing summary box if any
  const existingBox = document.getElementById("visua11y-summary-box");
  if (existingBox) {
    existingBox.remove();
  }

  const summaryBox = document.createElement("div");
  summaryBox.id = "visua11y-summary-box";

  // Format text and add it to the summary box
  const formattedContent = formatText(text);
  summaryBox.innerHTML = `
    <div class="summary-content">${formattedContent}</div>
    <button id="visua11y-close-btn" class="close-button">Close</button>
  `;

  summaryBox.style.position = "fixed";
  summaryBox.style.top = "50%";
  summaryBox.style.left = "50%";
  summaryBox.style.transform = "translate(-50%, -50%)";
  summaryBox.style.zIndex = "10000";

  document.body.appendChild(summaryBox);
  console.log("✅ Centered summary box added to page with formatted content");

  document.getElementById("visua11y-close-btn").addEventListener("click", () => {
    summaryBox.remove();
  });
}
