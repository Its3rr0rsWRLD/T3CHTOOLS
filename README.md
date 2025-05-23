<div align="center">

<pre>
 /$$$$$$$$ /$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$$$ /$$$$$$   /$$$$$$  /$$        /$$$$$$ 
|__  $$__//$$__  $$ /$$__  $$| $$  | $$|__  $$__//$$__  $$ /$$__  $$| $$       /$$__  $$
   | $$  |__/  \ $$| $$  \__/| $$  | $$   | $$  | $$  \ $$| $$  \ $$| $$      | $$  \__/
   | $$     /$$$$$/| $$      | $$$$$$$$   | $$  | $$  | $$| $$  | $$| $$      |  $$$$$$ 
   | $$    |___  $$| $$      | $$__  $$   | $$  | $$  | $$| $$  | $$| $$       \____  $$
   | $$   /$$  \ $$| $$    $$| $$  | $$   | $$  | $$  | $$| $$  | $$| $$       /$$  \ $$
   | $$  |  $$$$$$/|  $$$$$$/| $$  | $$   | $$  |  $$$$$$/|  $$$$$$/| $$$$$$$$|  $$$$$$/
   |__/   \______/  \______/ |__/  |__/   |__/   \______/  \______/ |________/ \______/ 
</pre>

# T3CHTOOLS

**Roblox-focused utility tools for automation, analysis, and API learning.**

⚠️ Educational use only. Built for developers to explore Roblox systems safely. ⚠️

</div>

---

## 📖 Overview

T3CHTOOLS is a Node.js-based toolkit designed to explore and understand Roblox's APIs and automation capabilities. Originally a private project, it's now being revisited and refined for public educational use.

> **Note:** This project is a work in progress. Expect updates and improvements over time.

---

## ⚠️ Legal Disclaimer

This project is intended **strictly for educational and research purposes**. It does not promote or support any activities that violate Roblox's Terms of Service.

- No features are intended to exploit, damage, or disrupt Roblox services.
- The author is not responsible for how others use or modify this code.
- **Use responsibly. Do not violate Roblox's TOS.**

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- Terminal or command-line access
- Basic understanding of JavaScript and Roblox APIs

### Installation

```bash
git clone https://github.com/Its3rr0rsWRLD/T3CHTOOLS.git
cd T3CHTOOLS
npm install
```

### Usage

```bash
node index.js
```

Follow the on-screen prompts to interact with the available tools.

---

## 📁 Project Structure

```
T3CHTOOLS/
├── node_modules/
├── tools/              # Various scripts/utilities (WIP)
├── index.js            # CLI runner
├── package.json
└── README.md
```

---

## 🧰 Included Tools

<details>
<summary><strong>📦 Click to view tool list</strong></summary>

### ✅ Proxy Scraper
Scrapes fresh public proxies from multiple real-time updated sources. Saves to `proxies.txt`.
- Supports multithreading
- Fast and highly concurrent

### ✅ Proxy Checker
Checks proxies (in `ip:port` or `ip:port:user:pass` format) for validity using Roblox as the endpoint.
- Optional auto-delete for failed proxies

### ✅ Proxy Generator
Uses captcha bypass (CapSolver/Capmonster) to register accounts on Webshare.io and download fresh authenticated proxies.
- Uses rotating proxies
- Highly parallel with thread configuration

### ✅ User Scraper
Scrapes full Roblox user data by ID range.
- Public data only
- Configurable threading, batch size, and auto-deduplication
- Saves to JSONL format

### ✅ Friend Scraper
Recursively scrapes all friends of a given user ID to a specific depth.
- Supports proxies
- Handles rate limits
- Displays progress with estimated completion

### ✅ Username Sniper
Brute-forces every possible username of a given length and charset to check for availability.
- Threaded username validation
- Logs valid and invalid checks
- Saves available names to text file

</details>

---

## 🛠 Status

> 🔧 **Actively being rebuilt**

All tools are being optimized for concurrency and real-time scraping.
More features and modules will be added.

---

## 📄 License

T3CHTOOLS is licensed under the **T3CHTOOLS Non-Commercial License (TNCL) v1.0**.  
See the full [LICENSE](LICENSE) for details.

<details>
<summary><strong>🔍 TL;DR – What You Can & Can't Do</strong></summary>

✅ **You can:**
- Use it for personal, educational, or internal projects
- Modify, fork, and build on it (with credit)

❌ **You can't:**
- Use it in anything that makes money (ads, selling, subscriptions, etc.)
- Redistribute or integrate it commercially without written permission

📌 **Always give credit** and **link back to the original repo**

</details>

---

## 🧠 Creator

Made by **@Its3rr0rsWRLD**

For questions or suggestions, reach out on Discord: **@Its3rr0rsWRLD**
