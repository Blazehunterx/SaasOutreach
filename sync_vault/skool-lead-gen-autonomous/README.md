# 24/7 Skool Discovery & Lead Generation Harvester

This engine is designed to operate autonomously to find High-Intent Skool Community Owners for the "Multi-Platform Outreach Engine."

## 🚀 Setup Instructions

1. **Prerequisites**: Ensure you have Node.js installed.
2. **Installation**:
   Open a terminal in this directory and run:
   ```bash
   npm install
   npx playwright install chromium
   ```
3. **Run the Harvester**:
   ```bash
   node skool_harvester.js
   ```

## ⚙️ How it Works

1. **Phase 1: Discovery**: The script iterates through top categories (Business, Marketing, AI, etc.) on `skool.com/discovery`. It filters for groups with **500 – 5,000 members**.
2. **Phase 2: Deep Audit**: For every group discovered, the script visits the "About" page to extract:
   - **Owner Name**
   - **Skool Profile Link**
   - **Social Links** (LinkedIn, X, Instagram)
3. **Storage**: All data is stored in `market_opportunities.json`. 

## 📊 Integration

This project is completely isolated from your existing outreach scripts. To feed these leads into your main engine:
- Point your outreach scripts to read from `market_opportunities.json`.
- Or, let the harvester run 24/7 and manually export the JSON to your Outreach CSV when you need a fresh batch.

## 🛡️ Stealth Features
- Uses `playwright-extra` with the Stealth plugin to avoid bot detection.
- Humanized scrolling and navigation delays.
- Randomized search category order.

---
*Maintained by Antigravity AI*
