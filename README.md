# Visua11y: AI-Powered Accessibility Chrome Extension

Visua11y is a Chrome extension that leverages AI to make the web more accessible for people with disabilities. Currently in Phase 1 development, it provides smart text summarization to help users quickly understand long or complex content.

## 🚀 **Current Status (Phase 1 Complete)**

**✅ What's Working Now:**
- **Smart Text Summarization**: Right-click selected text → "Summarize with Visua11y"
- **AI Backends**: Tries Chrome’s built‑in AI first; falls back to OpenAI if a key is configured
- **Graceful UI**: Summary boxes appear near selected text with accessible styling

**🎯 Who This Helps Right Now:**
- People with dyslexia or reading difficulties
- People with ADHD who have trouble focusing on long text
- People learning English as a second language  
- Anyone who wants to quickly understand long articles

**🔄 Recent Improvements:**
- **Removed file-based secrets**: No packaged `config.json`; keys live only in extension storage
- **Safer permissions**: Dropped `debugger` permission; TLDR uses `chrome.scripting`
- **Lean manifest**: Only `https://api.openai.com/*` host permission

## 🔧 **How to Set Up and Use**

### **Installation:**
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the project folder
5. The Visua11y icon should appear in your Chrome toolbar

### **Ready to Use:**
- If Chrome Built‑in AI summarizer is available, it works out of the box.
- For consistent results and for TLDR/Layout Analysis, add an OpenAI API key in the popup.
  See [`SETUP.md`](./SETUP.md).

### **How to Use:**
1. Visit any webpage with text
2. Select/highlight the text you want summarized
3. Right-click and choose "Summarize with Visua11y"
4. A summary box will appear near your selected text
5. Click "Close" to dismiss the summary

## 🏗️ **Project Structure (For Developers)**

### **📁 File Organization**
```
visua11y/
├── manifest.json              # Extension configuration & permissions
├── background/                # Background processing (the "brain")
│   ├── service-worker.js     # Main controller & context menu handler
│   └── ai-manager.js         # AI service coordination (Chrome AI + OpenAI API)
├── content/                   # Web page interaction
│   └── content-script.js     # Displays summaries on web pages
├── popup/                     # Extension status interface
│   ├── popup.html           # Simple status window layout
│   └── popup.js             # Status display logic
└── assets/                    # Visual assets & styling
    ├── icons/               # Extension icons (16px, 48px, 128px)
    │   ├── icon16.png
    │   ├── icon48.png
    │   └── icon128.png
    └── styles/              # CSS styling
        ├── popup.css        # Settings window styling
        └── summary-box.css  # Summary display styling
```

### **🔄 How It Works (Technical Flow)**
1. **User selects text** → `service-worker.js` detects right-click menu selection
2. **Menu clicked** → Service worker calls `ai-manager.js` to process text
3. **AI processing** → Tries Chrome AI → OpenAI API → Basic fallback (in that order)
4. **Summary created** → Service worker sends result to `content-script.js`
5. **Display** → Content script shows styled summary box on the webpage

### **🤖 AI Strategy**
- **Primary**: Chrome Built‑in Summarizer API (when available)
- **Secondary**: OpenAI API (`gpt-4o-mini`) using your key
Note: If neither backend is available, the extension shows a friendly error instead of a heuristic summary.

## 📋 **Future Development Plan**

### **Phase 2: Reading & Comprehension Assistance** (Week 3-4)
**Goal**: Enhance text readability and comprehension

**Features to implement:**
1. **Text Simplification** (Using Rewriter API)
   - Rewrite complex sentences in simpler language
   - Adjust reading level (elementary, middle school, etc.)
   - Replace jargon with common terms

2. **Content Enhancement** (Using Writer API)
   - Add context explanations for technical terms
   - Generate definitions for complex words
   - Create bullet-point versions of paragraphs

**Target Users**: People with dyslexia, learning disabilities, non-native speakers

---

### **Phase 3: Visual & Navigation Assistance** (Week 5-6)
**Goal**: Help users with visual impairments and navigation difficulties

**Features to implement:**
1. **Smart Image Descriptions** (Using Prompt API)
   - Generate alt-text for images missing descriptions
   - Describe charts, graphs, and infographics
   - Context-aware descriptions based on surrounding content

2. **Page Structure Analysis**
   - Auto-generate page outlines and navigation
   - Identify and label page sections
   - Create skip links for better navigation

**Target Users**: People with visual impairments, screen reader users

---

### **Phase 4: Language & Communication Support** (Week 7-8)
**Goal**: Break down language barriers and improve communication

**Features to implement:**
1. **Real-time Translation** (Using Translator API)
   - Translate selected text or entire pages
   - Support for multiple languages
   - Preserve formatting and context

2. **Language Detection & Assistance** (Using Language Detector API)
   - Auto-detect page language
   - Offer translation when needed
   - Pronunciation guides for difficult words

**Target Users**: Non-native speakers, people with hearing impairments who rely on text

---

### **Phase 5: Advanced Personalization** (Week 9-10)
**Goal**: Create personalized accessibility profiles

**Features to implement:**
1. **User Profiles & Preferences**
   - Save user accessibility needs
   - Customize AI model responses
   - Remember preferred reading levels and formats

2. **Smart Adaptation**
   - Learn from user interactions
   - Automatically apply preferred settings to new sites
   - Suggest helpful features based on content type

**Target Users**: All users with varying accessibility needs

---

### **Phase 6: Integration & Advanced Features** (Week 11-12)
**Goal**: Advanced AI-powered accessibility features

**Features to implement:**
1. **Form Assistance**
   - Auto-fill forms intelligently
   - Explain form requirements in simple language
   - Validate and suggest corrections

2. **Content Organization**
   - Create custom reading lists
   - Organize content by difficulty level
   - Generate study guides from web content

**Target Users**: People with motor disabilities, cognitive impairments

---

## 🎯 **Technical Implementation Details**

### **Chrome AI APIs to Use:**
- **Summarizer API**: For content summarization ✅ (Currently implemented)
- Other APIs (Rewriter, Writer, Translator, Language Detector, Prompt) are planned and not yet implemented.

### **Current Architecture:**
```
├── manifest.json (Extension configuration)
├── background/
│   ├── service-worker.js (Background tasks) ✅
│   └── ai-manager.js (AI API handling) ✅
├── content/
│   └── content-script.js (Web page interaction) ✅
├── popup/
│   ├── popup.html (Extension popup) ✅
│   └── popup.js (Popup logic) ✅
└── assets/
    ├── icons/ (Extension icons) ✅
    └── styles/ (CSS files) ✅
```

### **Accessibility Standards:**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode support

### **Permissions**
- `activeTab`, `scripting`, `contextMenus`, `tabs`, `storage` — required for context‑menu actions, injecting the content script, saving keys, and operating on the current tab.
- Host permissions: `https://api.openai.com/*` and `https://generativelanguage.googleapis.com/*` only.

---

## 🛠️ **Development Setup**

### **Prerequisites:**
- Chrome browser with developer mode enabled
- Basic understanding of Chrome extension development

### **For Developers:**
See [`CLAUDE.md`](./CLAUDE.md) for detailed development commands and architecture guidance.

### **For Production Deployment:**
See [`PRODUCTION.md`](./PRODUCTION.md) for the complete production readiness checklist.

---

## 🚀 **Implementation Strategy**

**✅ Week 1-2**: Phase 1 - Basic extension setup and summarization (COMPLETE)
**📅 Week 3-4**: Phase 2 - Add text rewriting and simplification features  
**📅 Week 5-6**: Phase 3 - Implement visual assistance features
**📅 Week 7-8**: Phase 4 - Add translation and language support
**📅 Week 9-10**: Phase 5 - Build personalization features
**📅 Week 11-12**: Phase 6 - Advanced features and polish

Each phase builds upon the previous one, allowing for incremental testing and user feedback. 

## 🚀 **Accessibility-First Design**

### **Why No Setup Required?**
- **Lower barriers to adoption**: Anyone can use accessibility tools immediately
- **Privacy-focused**: Chrome built-in AI keeps data local
- **Cost-effective**: Free AI services make accessibility tools available to everyone
- **Reliable**: Multiple fallbacks ensure the extension always works

### **AI Service Architecture**
```text
Priority order for AI services:
1) Chrome Built‑in AI (if available)
2) OpenAI API (requires key)
3) Gemini API (optional; key supported in popup)
```

### **Benefits**
- **No key needed when Chrome AI is available**
- **Low‑friction setup** via popup for OpenAI/Gemini
- **Reduced permissions** and no packaged secrets

---

## 📚 **Documentation**

- **[`README.md`](./README.md)** - This file: Project overview, installation, and usage
- **[`SETUP.md`](./SETUP.md)** - Detailed API key configuration guide  
- **[`CLAUDE.md`](./CLAUDE.md)** - Developer guidance for Claude Code instances
- **[`PRODUCTION.md`](./PRODUCTION.md)** - Production readiness checklist (65 items)
