<div align="center">
  <img src="https://img.icons8.com/fluency/150/telegram-app.png" alt="Telegram Bot Logo" width="100"/>

  # ✨ Telegram Instant Chat ID Finder

  <p align="center">
    <b>The fastest, most elegant way to look up any Telegram ID.</b>
    <br/>
    Powered by Cloudflare Workers for zero-latency edge performance worldwide.
  </p>

  <p align="center">
    <a href="https://t.me/TGInstantChatIDBot"><img src="https://img.shields.io/badge/Live_Bot-@TGInstantChatIDBot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Live Bot"/></a>
    <img src="https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
    <img src="https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  </p>
</div>

<br/>

> **Never struggle to find a Telegram ID again.** Whether it's a user, a private group, a public channel, or a premium user — just forward a message or tap a button, and get the exact numeric ID instantly.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| ⚡ **Instant ID Retrieval** | Get the unique numeric ID of any Telegram user, bot, group, or channel instantly. |
| 🌍 **Works Everywhere** | Fully supports public & private groups/channels, premium users, and bots. |
| 🔄 **Forward Detection** | Forward any message to the bot to precisely identify the original sender, gracefully handling hidden users. |
| 📱 **Cross-Platform Links** | Automatically generates 1-click Android & iOS deep links to open user profiles directly. |
| 🎨 **Stunning WebApp UI** | Features a beautifully designed, responsive Telegram WebApp with a live profile card and ambient backgrounds. |
| 🎉 **Message Effects** | Enjoy delightful animated message effects (🔥, 🎉, 👍, 💩) tailored to different chat types. |
| 🛡️ **Privacy First** | **Zero Data Logging**. Everything is processed in real-time on the edge and instantly discarded. |

---

## 🛠 Available Commands

Easily control the bot using the following commands:

| Command | Action |
| :--- | :--- |
| `/start` | Open the main menu & interactive share buttons |
| `/me` | View your own Telegram profile & ID details |
| `/about` | Learn about the bot and its technology stack |
| `/help` | Read detailed usage instructions |
| `/donate` | Support development via Crypto donations |
| `/donate_stars`| Support the creator with Telegram Stars ⭐ |

---

## 🚀 One-Click Deployment (Cloudflare Workers)

Deploy your own instance of this bot completely serverless and for **free** on Cloudflare.

### 📋 Prerequisites
- A [Cloudflare](https://dash.cloudflare.com/) account.
- A Telegram Bot Token from [@BotFather](https://t.me/BotFather).

### ⚙️ Step-by-Step Guide

1. Log in to your Cloudflare Dashboard and navigate to **Workers & Pages**.
2. Click **Create Application** -> **Create Worker**.
3. Name your worker (e.g., `chat-id-bot`) and click **Deploy**.
4. Click **Edit code** and completely replace the default code with the contents of `instantchatidstyle.js`.
5. 🔑 **Configure Token**: At the very top of the script, insert your Bot Token:
   ```javascript
   // Replace with your actual bot token 
   const BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";
   ```
6. *(Optional)* Set `ADMIN_ID` in `BOT_CONFIG` to your personal Telegram User ID for admin features.
7. Click **Save and Deploy** in the top right corner.
8. 🔗 **Set the Webhook**: Open your web browser and visit the following URL (replace the placeholders with your actual token and worker URL):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>
   ```
   > ✅ *Success: You should see a JSON response stating `"Webhook was set"`.*

**Your bot is now live and ready to process requests at lightning speed! 🚀**

---

## 👨‍💻 Creator & Support

<div align="center">
  <b>Built with ❤️ by <a href="https://t.me/Ashlynn_Repository">@Ashlynn_Repository</a></b>
  <br/>
  <i>Open source spirit, premium quality.</i>
  <br/><br/>
  If you love this project, consider dropping a ⭐ on this repository!
</div>
