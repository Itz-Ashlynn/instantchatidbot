
// Bot token - Replace with your actual bot token 
const BOT_TOKEN = "";

// API endpoints
const API_ENDPOINTS = {
  TELEGRAM_API: `https://api.telegram.org/bot${BOT_TOKEN}`
};

// Bot configuration
const BOT_CONFIG = {
  ADMIN_ID: 7427294551 // Replace with your admin user ID
};

// Mapping of chat types and effect IDs
const types = {
  1: { name: 'User', effect_id: '5107584321108051014' }, // 👍 Thumbs Up
  2: { name: 'Private Channel', effect_id: '5046589136895476101' }, // 💩 Poop
  3: { name: 'Private Group', effect_id: '5104858069142078462' }, // 👎 Thumbs Down
  4: { name: 'Public Channel', effect_id: '5104841245755180586' }, // 🔥 Fire
  5: { name: 'Public Group', effect_id: '5046509860389126442' }, // 🎉 Confetti
  6: { name: 'Bot', effect_id: '5046509860389126442' }, // 🎉 Confetti
  7: { name: 'Premium User', effect_id: '5046509860389126442' } // 🎉 Confetti
};

// Message effect ID for the /start command
const START_EFFECT_ID = "5104841245755180586"; // 🔥 Fire

// Function to log errors and debug info
function logError(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  if (data) {
    console.log(`[${timestamp}] Data: ${JSON.stringify(data, null, 2)}`);
  }
}

// Function to create inline keyboard for all commands
function createInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'ℹ️ About', callback_data: 'about', style: 'primary' },
        { text: '🆘 Help', callback_data: 'help', style: 'primary' },
        { text: '📢 Channel', url: 'https://t.me/Ashlynn_Repository' }
      ],
      [
        { text: '⭐ Donate Stars', callback_data: 'donate_stars', style: 'success' },
        { text: '💖 Donate Money', callback_data: 'donate_money', style: 'success' }
      ]
    ]
  };
}

async function sendInvoice(chatId) {
  logError(`Sending invoice to chat: ${chatId}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.TELEGRAM_API}/sendInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        title: "Donate to Ashlynn Repository Bot ✨",
        description: "Support our bot to keep it running and fund new features! Every ⭐ helps. Thank you! 🌟🚀",
        payload: '{}',
        provider_data: '{}',
        currency: 'XTR',
        prices: [{ label: 'Pay ⭐️10', amount: 10 }]
      })
    });
    const data = await response.json();
    logError(`sendInvoice API response: ${JSON.stringify(data, null, 2)}`);
    if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
    return data;
  } catch (error) {
    logError(`sendInvoice error: ${error.message}`);
    await sendHTMLMessage(BOT_TOKEN, chatId, "*❌ Failed to send donation invoice.*\nPlease try again later.");
    return false;
  }
}

async function handlePreCheckout(query) {
  logError(`Handling pre-checkout query: ${query.id}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.TELEGRAM_API}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: query.id,
        ok: true
      })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
    await sendHTMLMessage(BOT_TOKEN, query.from.id, "Thank you for your donation! 💝\nYour support keeps us thriving!");
  } catch (error) {
    logError(`handlePreCheckout error: ${error.message}`);
  }
}

async function processRefund(chatId, userId, chargeId) {
  logError(`Processing refund for user: ${userId}, transaction: ${chargeId}`);
  try {
    const response = await fetch(`${API_ENDPOINTS.TELEGRAM_API}/refundStarPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        telegram_payment_charge_id: chargeId
      })
    });
    const data = await response.json();
    logError(`Refund API response: ${JSON.stringify(data, null, 2)}`);
    if (!data.ok) throw new Error(`Telegram API error: ${data.description}`);
    await sendHTMLMessage(BOT_TOKEN, chatId, "Refund processed successfully ✅");
  } catch (error) {
    logError(`processRefund error: ${error.message}`);
    await sendHTMLMessage(BOT_TOKEN, chatId, "❌ Refund failed.\nPlease verify the details and retry.");
  }
}

async function editMessage(token, chat_id, message_id, text, keyboard = null) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const payload = {
    chat_id: chat_id,
    message_id: message_id,
    text: text,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logError(`HTTP error! status: ${response.status}`);
      return false;
    }

    const result = await response.json();
    if (!result.ok) {
      logError(`Telegram API error for edit message: ${JSON.stringify(result)}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Failed to edit message: ${error.message}`);
    return false;
  }
}

async function answerCallbackQuery(token, callback_query_id, text = null, show_alert = false) {
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  const payload = {
    callback_query_id: callback_query_id
  };

  if (text) {
    payload.text = text;
  }
  if (show_alert) {
    payload.show_alert = show_alert;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logError(`HTTP error! status: ${response.status}`);
      return false;
    }

    const result = await response.json();
    if (!result.ok) {
      logError(`Telegram API error for answer callback: ${JSON.stringify(result)}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Failed to answer callback query: ${error.message}`);
    return false;
  }
}

async function answerInlineQuery(token, inline_query_id, results, cache_time = 0) {
  const url = `https://api.telegram.org/bot${token}/answerInlineQuery`;
  const payload = {
    inline_query_id: inline_query_id,
    results: results,
    cache_time: cache_time,
    is_personal: true
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logError(`HTTP error! status: ${response.status}`);
      return false;
    }

    const result = await response.json();
    if (!result.ok) {
      logError(`Telegram API error for answer inline query: ${JSON.stringify(result)}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Failed to answer inline query: ${error.message}`);
    return false;
  }
}

// Function to handle inline queries
async function handleInlineQuery(inline_query) {
  const user = inline_query.from;
  const inline_query_id = inline_query.id;
  const query = inline_query.query; // Not strictly used for this feature but good to have

  logError(`Handling inline query from user: ${user.id}`);

  try {
    const user_mention = `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;
    const user_info_text =
      `<b>👤 User Information</b>\n\n` +
      `<b>Full Name:</b> <code>${user.first_name} ${user.last_name || ''}</code>\n` +
      `<b>Username:</b> ${user.username ? '@' + user.username : 'None'}\n` +
      `<b>User ID:</b> <code>${user.id}</code>\n` +
      `<b>Mention:</b> ${user_mention}\n` +
      `<b>Is Bot:</b> <code>${user.is_bot ? 'Yes' : 'No'}</code>\n` +
      `<b>Is Premium:</b> <code>${user.is_premium ? 'Yes' : 'No'}</code>\n` +
      `<b>Language:</b> <code>${user.language_code || 'Unknown'}</code>`;

    const results = [
      {
        type: "article",
        id: crypto.randomUUID(),
        title: `ℹ️ Your Info: ${user.first_name}`,
        description: "Click to see your Telegram info!",
        input_message_content: {
          message_text: user_info_text,
          parse_mode: "HTML",
          disable_web_page_preview: true
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: "Try it!", switch_inline_query: "" }]
          ]
        }
      }
    ];

    await answerInlineQuery(BOT_TOKEN, inline_query_id, results);
    return new Response('OK', { status: 200 });

  } catch (error) {
    logError(`Error handling inline query: ${error.message}`);
    // Attempt to answer empty to stop loading state on client
    await answerInlineQuery(BOT_TOKEN, inline_query_id, []);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Function to handle callback queries
async function handleCallbackQuery(callback_query) {
  const chat_id = callback_query.message.chat.id;
  const message_id = callback_query.message.message_id;
  const callback_data = callback_query.data;
  const callback_query_id = callback_query.id;

  logError(`Handling callback query: ${callback_data} from chat: ${chat_id}`);

  try {
    switch (callback_data) {
      case 'about':
        const about_text =
          "🤖 <b>Chat ID Finder Bot</b>\n" +
          "<i>The fastest way to look up any Telegram ID.</i>\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>🎯 What it does</b>\n" +
          "Instantly reveal the unique numeric ID of any Telegram user, bot, group, or channel — with one tap.\n\n" +
          "<b>⚡ Powered by</b>\n" +
          "• Cloudflare Workers — serverless, global edge\n" +
          "• Telegram Bot API (latest version)\n" +
          "• Zero latency worldwide via CDN\n\n" +
          "<b>✨ Highlights</b>\n" +
          "• Works with ALL chat types (public & private)\n" +
          "• Animated message effects on results\n" +
          "• One-click Android & iOS deep links\n" +
          "• Forward detection & hidden user handling\n" +
          "• Telegram Mini App with live profile card\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>👨‍💻 Creator</b>\n" +
          "Built with ❤️ by <a href=\"https://t.me/Ashlynn_Repository\">@Ashlynn_Repository</a>\n" +
          "<blockquote>Open source spirit, premium quality. 🚀</blockquote>";

        const about_keyboard = {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu', style: 'primary' }]
          ]
        };

        await editMessage(BOT_TOKEN, chat_id, message_id, about_text, about_keyboard);
        await answerCallbackQuery(BOT_TOKEN, callback_query_id);
        break;

      case 'help':
        const help_text =
          "📖 <b>Help Center</b>\n" +
          "<i>Everything you need to know about Chat ID Finder Bot.</i>\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>🛠 Commands</b>\n" +
          "  /start — Open the main menu & share buttons\n" +
          "  /me — See your own Telegram profile & ID\n" +
          "  /about — Learn about this bot\n" +
          "  /donate — Support via crypto\n" +
          "  /donate_stars — Donate Telegram Stars ⭐\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>💡 How to use</b>\n" +
          "1️⃣ Tap <b>👤 Get User ID</b> → share any user → get their ID\n" +
          "2️⃣ Tap a group/channel button → share a chat → get its ID\n" +
          "3️⃣ <b>Forward</b> any message to identify the original sender\n" +
          "4️⃣ Use the returned links to open the user directly on Android or iOS\n\n" +
          "<b>🔍 Supported types</b>\n" +
          "• Regular users  •  Bots  •  Premium users\n" +
          "• Public groups & channels\n" +
          "• Private groups & channels\n\n" +
          "<blockquote>Still stuck? Reach out → @Ashlynn_Repository</blockquote>";

        const help_keyboard = {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu', style: 'primary' }]
          ]
        };

        await editMessage(BOT_TOKEN, chat_id, message_id, help_text, help_keyboard);
        await answerCallbackQuery(BOT_TOKEN, callback_query_id);
        break;

      case 'donate_stars':
        const donate_stars_text =
          "⭐ <b>Donate Stars</b>\n" +
          "<i>Support the bot with Telegram Stars!</i>\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>💫 Why donate?</b>\n" +
          "• Keeps the bot running & updated\n" +
          "• Funds new features & improvements\n" +
          "• Shows your appreciation 💝\n\n" +
          "<b>💰 Amount</b>\n" +
          "⭐ 10 Telegram Stars\n\n" +
          "<blockquote>Every star counts. Thank you! 🙏</blockquote>";

        const donate_stars_keyboard = {
          inline_keyboard: [
            [{ text: '⭐ Donate 10 Stars', callback_data: 'send_invoice', style: 'success' }],
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu', style: 'primary' }]
          ]
        };

        await editMessage(BOT_TOKEN, chat_id, message_id, donate_stars_text, donate_stars_keyboard);
        await answerCallbackQuery(BOT_TOKEN, callback_query_id);
        break;

      case 'send_invoice':
        await answerCallbackQuery(BOT_TOKEN, callback_query_id, "Sending donation invoice...");
        await sendInvoice(chat_id);
        break;

      case 'donate_money':
        const donate_money_text =
          "💖 <b>Support the Creator</b>\n" +
          "<i>Your donation directly funds development!</i>\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>🌍 Crypto (International)</b>\n" +
          "• USDT TRC20\n<code>TWcX3dnUCe7W6ttWXRh2SwdkB2BuUoDqKM</code>\n\n" +
          "• USDT BEP20\n<code>0xaf372fc0ebd385868f27b53adbdef38e8ffad372</code>\n\n" +
          "━━━━━━━━━━━━━━━━\n" +
          "<b>📬 Contact</b>\n" +
          "• Telegram: <a href=\"https://t.me/Ashlynn_Repository\">@Ashlynn_Repository</a>\n" +
          "• Email: aarabhofficial@pm.me\n\n" +
          "<blockquote>Every donation counts! Thank you! 🙏</blockquote>";

        const donate_money_keyboard = {
          inline_keyboard: [
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu', style: 'primary' }]
          ]
        };

        await editMessage(BOT_TOKEN, chat_id, message_id, donate_money_text, donate_money_keyboard);
        await answerCallbackQuery(BOT_TOKEN, callback_query_id);
        break;

      case 'back_to_menu':
        const menu_text =
          "🏠 <b>Main Menu</b>\n" +
          "<i>Choose an action from the buttons below.</i>";
        const menu_keyboard = createInlineKeyboard();

        await editMessage(BOT_TOKEN, chat_id, message_id, menu_text, menu_keyboard);
        await answerCallbackQuery(BOT_TOKEN, callback_query_id);
        break;

      default:
        await answerCallbackQuery(BOT_TOKEN, callback_query_id, "Unknown action", true);
        break;
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    logError(`Error handling callback query: ${error.message}`);
    await answerCallbackQuery(BOT_TOKEN, callback_query_id, "An error occurred", true);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Function to send messages with HTML formatting and optional message effect
async function sendHTMLMessage(token, chat_id, text, keyboard = null, disable_link_preview = false, message_effect_id = null) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chat_id,
    text: text,
    parse_mode: 'HTML'
  };

  if (keyboard) {
    payload.reply_markup = keyboard;
  }
  if (disable_link_preview) {
    payload.disable_web_page_preview = true;
  }
  if (message_effect_id) {
    payload.message_effect_id = message_effect_id;
  }

  logError(`Sending message payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    logError(`Response status: ${response.status}, Response body: ${responseText}`);

    if (!response.ok) {
      logError(`HTTP error! status: ${response.status}, body: ${responseText}`);
      return false;
    }

    const result = JSON.parse(responseText);
    if (!result.ok) {
      logError(`Telegram API error for chat_id ${chat_id}: ${JSON.stringify(result)}`);
      return false;
    }

    logError(`Message sent successfully to chat_id ${chat_id}`);
    return true;
  } catch (error) {
    logError(`Failed to send message to chat_id ${chat_id}: ${error.message}`);
    return false;
  }
}

// Function to create the home page
function createHomePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Chat ID Finder - Telegram WebApp</title>
      <meta name="description" content="Advanced Chat ID Finder & User Information Bot for Telegram" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <script src="https://unpkg.com/lucide@latest"></script>
    </head>
    <body class="min-h-screen bg-neutral-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-100" style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;">
      <div class="relative">
        <!-- Ambient backgrounds -->
        <div class="pointer-events-none fixed inset-0 opacity-[0.18]">
          <div class="absolute -top-24 -left-24 h-[36rem] w-[36rem] bg-indigo-600/30 blur-3xl rounded-full"></div>
          <div class="absolute -bottom-32 -right-20 h-[32rem] w-[32rem] bg-purple-600/30 blur-3xl rounded-full"></div>
        </div>
    
        <!-- App Shell -->
        <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <!-- Top Bar -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-md bg-slate-100/5 ring-1 ring-white/10 flex items-center justify-center">
                <span class="text-sm font-semibold tracking-tight">AR</span>
              </div>
              <div class="hidden sm:block text-sm text-slate-300/80">Chat ID Finder</div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <a href="https://t.me/TGInstantChatIDBot" class="hidden sm:inline-flex items-center gap-2 rounded-md border border-white/10 bg-slate-100/5 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-100/10 hover:border-white/20 transition-colors">
                <i data-lucide="telegram" class="h-4 w-4"></i>
                Open in Telegram
              </a>
              <button id="fab" aria-label="Open settings" class="rounded-full p-2.5 sm:p-3 bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                <i data-lucide="settings" class="h-5 w-5"></i>
              </button>
            </div>
          </div>
    
          <!-- User Profile -->
          <section id="userProfile" class="theme-surface mt-6 sm:mt-8 hidden rounded-2xl border border-white/10 bg-slate-100/5 backdrop-blur-md p-4 sm:p-6 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div class="relative flex-shrink-0">
                <!-- Avatar: shows real photo if available, else letter -->
                <div id="userAvatar" class="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold tracking-tight shadow-xl shadow-indigo-900/40 ring-2 ring-white/10 overflow-hidden">
                  <!-- photo or letter injected by JS -->
                </div>
                <!-- Online / active dot -->
                <span class="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-neutral-950"></span>
                <!-- Premium crown badge -->
                <span id="userPremiumBadge" class="hidden absolute -top-1 -right-1 rounded-full bg-amber-400 text-amber-950 text-[9px] px-1.5 py-0.5 font-bold ring-1 ring-black/20 shadow">PRO</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 id="userName" class="text-xl sm:text-2xl font-bold tracking-tight truncate">Loading...</h3>
                  <span id="userPremiumLabel" class="hidden text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">✨ Premium</span>
                </div>
                <p id="userInfo" class="text-sm text-slate-400 mt-0.5">Connecting to Telegram...</p>
                <!-- Copy-able User ID row -->
                <div class="mt-3 flex items-center gap-2">
                  <span class="text-xs text-slate-400 uppercase tracking-wider">ID</span>
                  <code id="userId" class="text-sm font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">-</code>
                </div>
                <div class="grid grid-cols-3 gap-2 mt-3">
                  <div class="rounded-lg border border-white/10 bg-slate-100/5 p-2.5 text-center">
                    <div class="text-[10px] uppercase tracking-wider text-slate-500">Premium</div>
                    <div id="userPremium" class="mt-0.5 text-sm font-semibold text-slate-100">-</div>
                  </div>
                  <div class="rounded-lg border border-white/10 bg-slate-100/5 p-2.5 text-center">
                    <div class="text-[10px] uppercase tracking-wider text-slate-500">Language</div>
                    <div id="userLanguage" class="mt-0.5 text-sm font-semibold text-slate-100">-</div>
                  </div>
                  <div class="rounded-lg border border-white/10 bg-slate-100/5 p-2.5 text-center">
                    <div class="text-[10px] uppercase tracking-wider text-slate-500">Platform</div>
                    <div id="userPlatform" class="mt-0.5 text-sm font-semibold text-slate-100">-</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          <!-- Hero -->
          <header class="mt-6 sm:mt-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-100/10 to-slate-100/[0.03] p-5 sm:p-8 relative overflow-hidden">
            <div class="absolute inset-x-0 -top-10 h-24 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-fuchsia-500/15 blur-2xl"></div>
            <div class="relative">
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">Chat ID Finder Bot</h1>
              <p class="mt-2 sm:mt-3 text-sm sm:text-base text-slate-300/90">Advanced Chat ID Finder and User Information tool with deep links, forwarding, and more.</p>
              <div class="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a id="startBotBtn" href="https://t.me/TGInstantChatIDBot" class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-medium shadow-lg shadow-indigo-900/30 ring-1 ring-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                  <span id="loadingSpinner" class="hidden h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <i data-lucide="rocket" class="h-4 w-4"></i>
                  <span id="buttonText" class="tracking-tight">Start Using Bot</span>
                </a>
                <div class="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400/90">
                  <i data-lucide="shield-check" class="h-4 w-4"></i>
                  Made by Ashlynn Repository
                </div>
              </div>
            </div>
          </header>
    
          <!-- Features -->
          <section class="mt-6 sm:mt-8">
            <div class="flex items-end justify-between">
              <h2 class="text-xl sm:text-2xl font-semibold tracking-tight">Key Features</h2>
              <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400/80">
                <i data-lucide="zap" class="h-4 w-4"></i>
                Fast, reliable, global
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <!-- Feature Card -->
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="badge" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Instant ID Retrieval</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Get user, group, and channel IDs instantly with delightful feedback.</p>
                  </div>
                </div>
              </div>
    
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="link" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Cross-Platform Links</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Generate Android, iOS deep links and universal Telegram links easily.</p>
                  </div>
                </div>
              </div>
    
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="shield" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Privacy Respect</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Handles hidden users gracefully with clear guidance.</p>
                  </div>
                </div>
              </div>
    
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="forward" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Forward Message Support</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Forward messages to get detailed user or chat information.</p>
                  </div>
                </div>
              </div>
    
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="star" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Star Donation</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Support development with Telegram Stars—thank you!</p>
                  </div>
                </div>
              </div>
    
              <div class="reveal theme-chip group rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-all hover:shadow-lg hover:shadow-indigo-900/10">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20">
                    <i data-lucide="zap" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold tracking-tight">Lightning Fast</h3>
                    <p class="mt-1 text-sm text-slate-400/90">Edge-powered for global speed and reliability.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          <!-- Commands -->
          <section class="mt-6 sm:mt-8">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight">Available Commands</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <!-- Command -->
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="terminal" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/start</div>
                    <p class="text-sm text-slate-400/90">Open the main menu with sharing options.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="help-circle" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/help</div>
                    <p class="text-sm text-slate-400/90">Detailed help and documentation.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="user" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/me</div>
                    <p class="text-sm text-slate-400/90">Get your user ID and profile details.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="info" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/about</div>
                    <p class="text-sm text-slate-400/90">Learn about the bot and creator.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="coin" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/donate</div>
                    <p class="text-sm text-slate-400/90">Support with a donation.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="sparkles" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/donate_stars</div>
                    <p class="text-sm text-slate-400/90">Donate Telegram Stars to help the project.</p>
                  </div>
                </div>
              </div>
              <div class="reveal rounded-xl border border-white/10 bg-slate-100/5 p-4 hover:bg-slate-100/10 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="rounded-md p-2 bg-slate-100/5 ring-1 ring-white/10 text-indigo-300">
                    <i data-lucide="shield-off" class="h-5 w-5"></i>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-indigo-300 tracking-tight">/refund</div>
                    <p class="text-sm text-slate-400/90">Admin-only refund command.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          <!-- Privacy -->
          <section class="mt-6 sm:mt-8">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight">Privacy Policy</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <div class="reveal theme-chip rounded-xl border border-white/10 bg-slate-100/5 p-5">
                <div class="flex items-center gap-2 text-indigo-300">
                  <i data-lucide="lock" class="h-5 w-5"></i>
                  <span class="text-sm font-medium">Data Protection</span>
                </div>
                <p class="mt-2 text-sm text-slate-400/90">No personal data is stored. All operations are processed real-time without retention.</p>
              </div>
              <div class="reveal theme-chip rounded-xl border border-white/10 bg-slate-100/5 p-5">
                <div class="flex items-center gap-2 text-indigo-300">
                  <i data-lucide="cpu" class="h-5 w-5"></i>
                  <span class="text-sm font-medium">Real-time Processing</span>
                </div>
                <p class="mt-2 text-sm text-slate-400/90">Messages are processed instantly to retrieve IDs. Nothing is saved server-side.</p>
              </div>
              <div class="reveal theme-chip rounded-xl border border-white/10 bg-slate-100/5 p-5">
                <div class="flex items-center gap-2 text-indigo-300">
                  <i data-lucide="shield-check" class="h-5 w-5"></i>
                  <span class="text-sm font-medium">Secure Operations</span>
                </div>
                <p class="mt-2 text-sm text-slate-400/90">Uses official APIs and best practices to keep your data secure.</p>
              </div>
            </div>
          </section>
    
          <!-- Footer -->
          <footer class="mt-8 sm:mt-10 rounded-2xl border border-white/10 bg-slate-100/5 p-5 sm:p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="text-sm font-semibold tracking-tight">Created by @Ashlynn_Repository</div>
                <p class="text-xs text-slate-400/90">Crafting useful Telegram bots and tools.</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <a href="https://t.me/Death_Walkers" class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-100/5 px-3 py-2 text-sm hover:bg-slate-100/10 transition-colors">
                  <i data-lucide="smartphone" class="h-4 w-4"></i>
                  Owner
                </a>
                <a href="https://t.me/Ashlynn_Repository" class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-100/5 px-3 py-2 text-sm hover:bg-slate-100/10 transition-colors">
                  <i data-lucide="megaphone" class="h-4 w-4"></i>
                  Channel
                </a>
                <a href="mailto:aarabhofficial@pm.me" class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-100/5 px-3 py-2 text-sm hover:bg-slate-100/10 transition-colors">
                  <i data-lucide="mail" class="h-4 w-4"></i>
                  Email
                </a>
              </div>
            </div>
            <div class="mt-4 border-t border-white/10 pt-3 text-center text-xs text-slate-400/80">
              Made with ❤️ by @Ashlynn_Repository • Powered by Cloudflare Workers
            </div>
          </footer>
        </div>
      </div>
    
      <!-- Settings Drawer -->
      <div id="overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity"></div>
      <aside id="settingsPanel" class="fixed top-0 right-0 h-full w-full sm:w-[380px] translate-x-full transition-transform">
        <div class="h-full theme-surface flex flex-col bg-neutral-950 text-slate-100 border-l border-white/10">
          <div class="flex items-center justify-between p-4 border-b border-white/10">
            <div class="flex items-center gap-2">
              <i data-lucide="sliders-horizontal" class="h-5 w-5 text-indigo-300"></i>
              <h3 class="text-base font-semibold tracking-tight">Settings</h3>
            </div>
            <button id="closeSettings" class="rounded-md p-2 hover:bg-slate-100/5 ring-1 ring-transparent hover:ring-white/10 transition-colors" aria-label="Close settings">
              <i data-lucide="x" class="h-5 w-5"></i>
            </button>
          </div>
    
          <div class="p-4 space-y-2">
            <!-- Toggle Row -->
            <div class="flex items-center justify-between rounded-lg border border-white/10 bg-slate-100/5 p-3">
              <div>
                <div class="text-sm font-medium">Dark Mode</div>
                <p class="text-xs text-slate-400/90">Prefer darker interface</p>
              </div>
              <button id="darkModeToggle" role="switch" aria-checked="true" class="switch group relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500/80 ring-1 ring-white/10 transition-colors">
                <span class="absolute left-0.5 h-5 w-5 rounded-full bg-white translate-x-0 group-aria-checked:translate-x-5 transition-transform"></span>
              </button>
            </div>
    
            <div class="flex items-center justify-between rounded-lg border border-white/10 bg-slate-100/5 p-3">
              <div>
                <div class="text-sm font-medium">Haptic Feedback</div>
                <p class="text-xs text-slate-400/90">Subtle vibrations on actions</p>
              </div>
              <button id="hapticToggle" role="switch" aria-checked="true" class="switch group relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500/80 ring-1 ring-white/10 transition-colors">
                <span class="absolute left-0.5 h-5 w-5 rounded-full bg-white translate-x-0 group-aria-checked:translate-x-5 transition-transform"></span>
              </button>
            </div>
    
            <div class="flex items-center justify-between rounded-lg border border-white/10 bg-slate-100/5 p-3">
              <div>
                <div class="text-sm font-medium">Auto-expand</div>
                <p class="text-xs text-slate-400/90">Use full screen in Telegram</p>
              </div>
              <button id="autoExpandToggle" role="switch" aria-checked="true" class="switch group relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500/80 ring-1 ring-white/10 transition-colors">
                <span class="absolute left-0.5 h-5 w-5 rounded-full bg-white translate-x-0 group-aria-checked:translate-x-5 transition-transform"></span>
              </button>
            </div>
    
            <div class="flex items-center justify-between rounded-lg border border-white/10 bg-slate-100/5 p-3">
              <div>
                <div class="text-sm font-medium">Show User Profile</div>
                <p class="text-xs text-slate-400/90">Display Telegram user details</p>
              </div>
              <button id="showProfileToggle" role="switch" aria-checked="true" class="switch group relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500/80 ring-1 ring-white/10 transition-colors">
                <span class="absolute left-0.5 h-5 w-5 rounded-full bg-white translate-x-0 group-aria-checked:translate-x-5 transition-transform"></span>
              </button>
            </div>
          </div>
    
          <div class="mt-auto p-4 border-t border-white/10">
            <button id="resetSettings" class="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-100/5 px-3 py-2.5 text-sm hover:bg-slate-100/10 transition-colors">
              <i data-lucide="rotate-ccw" class="h-4 w-4"></i>
              Reset to defaults
            </button>
          </div>
        </div>
      </aside>
    
      <!-- Toast -->
      <div id="toast" class="fixed top-4 left-1/2 -translate-x-1/2 z-[60] opacity-0 pointer-events-none transition-all"></div>
    
      <script>
        // Icons
        function mountIcons() {
          if (window.lucide) {
            window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } });
          }
        }
    
        // App state
        const settings = {
          darkMode: true,
          hapticFeedback: true,
          autoExpand: true,
          showProfile: true
        };
    
        // UI helpers
        function showToast(message, tone = 'info') {
          const toast = document.getElementById('toast');
          toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] sm:max-w-md';
          toast.innerHTML = \`
            <div class="rounded-lg border px-4 py-2.5 text-sm shadow-lg ring-1 transition-all
              \${tone === 'success' ? 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30 ring-white/10' :
                 tone === 'error' ? 'bg-rose-500/10 text-rose-100 border-rose-400/30 ring-white/10' :
                 'bg-slate-100/10 text-slate-100 border-white/10 ring-white/10'}">
              \${message}
            </div>
          \`;
          requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.pointerEvents = 'auto';
            toast.style.transform = 'translateX(-50%) translateY(0)';
          });
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.pointerEvents = 'none';
          }, 2400);
        }
    
        function setSwitch(el, on) {
          el.setAttribute('aria-checked', on ? 'true' : 'false');
          el.classList.toggle('bg-indigo-500/80', on);
          el.classList.toggle('bg-slate-600/60', !on);
          const knob = el.querySelector('span');
          if (knob) {
            knob.style.transform = on ? 'translateX(20px)' : 'translateX(0)';
          }
        }
    
        function saveSettings() {
          try { localStorage.setItem('chatIdBotSettings', JSON.stringify(settings)); } catch(e) {}
        }
    
        function loadSettings() {
          try {
            const saved = localStorage.getItem('chatIdBotSettings');
            if (saved) Object.assign(settings, JSON.parse(saved));
          } catch(e) {}
        }
    
        // Theming: swap classes on surfaces to emulate light/dark without custom CSS
        function applyTheme() {
          const dark = settings.darkMode;
          const body = document.body;
          // Body
          body.classList.toggle('bg-neutral-950', dark);
          body.classList.toggle('text-slate-100', dark);
          body.classList.toggle('bg-slate-50', !dark);
          body.classList.toggle('text-slate-900', !dark);
    
          // Surfaces
          document.querySelectorAll('.theme-surface').forEach(el => {
            el.classList.toggle('bg-slate-100/5', dark);
            el.classList.toggle('border-white/10', dark);
            el.classList.toggle('bg-white', !dark);
            el.classList.toggle('border-black/10', !dark);
            el.classList.toggle('shadow-sm', !dark);
          });
    
          // Chips / cards
          document.querySelectorAll('.theme-chip').forEach(el => {
            el.classList.toggle('bg-slate-100/5', dark);
            el.classList.toggle('border-white/10', dark);
            el.classList.toggle('bg-white', !dark);
            el.classList.toggle('border-black/10', !dark);
            el.classList.toggle('hover:bg-slate-100', !dark);
            el.classList.toggle('hover:bg-slate-100/10', dark);
          });
        }
    
        function applySettings() {
          // Switches
          setSwitch(document.getElementById('darkModeToggle'), settings.darkMode);
          setSwitch(document.getElementById('hapticToggle'), settings.hapticFeedback);
          setSwitch(document.getElementById('autoExpandToggle'), settings.autoExpand);
          setSwitch(document.getElementById('showProfileToggle'), settings.showProfile);
    
          // Profile visibility
          const up = document.getElementById('userProfile');
          if (up) up.style.display = settings.showProfile ? '' : 'none';
    
          // Theme
          applyTheme();
        }
    
        // Settings panel
        function openSettings() {
          const panel = document.getElementById('settingsPanel');
          const overlay = document.getElementById('overlay');
          overlay.classList.remove('pointer-events-none');
          overlay.classList.add('opacity-100');
          overlay.style.opacity = '1';
          panel.classList.remove('translate-x-full');
        }
        function closeSettings() {
          const panel = document.getElementById('settingsPanel');
          const overlay = document.getElementById('overlay');
          overlay.classList.add('pointer-events-none');
          overlay.classList.remove('opacity-100');
          overlay.style.opacity = '0';
          panel.classList.add('translate-x-full');
        }
    
        // Reveal on scroll
        function mountReveal() {
          const targets = document.querySelectorAll('.reveal');
          targets.forEach(t => {
            t.classList.add('opacity-0', 'translate-y-4', 'transition-all');
          });
          const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                e.target.classList.remove('opacity-0', 'translate-y-4');
                e.target.classList.add('opacity-100', 'translate-y-0');
                io.unobserve(e.target);
              }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
          targets.forEach(t => io.observe(t));
        }
    
        // Telegram integration
        function mountTelegram() {
          const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
          if (!tg) {
            showFallbackProfile();
            return;
          }
          try {
            tg.ready();
            if (settings.autoExpand) tg.expand();
    
            // Sync theme with Telegram
            if (tg.colorScheme === 'light') {
              settings.darkMode = false;
            } else {
              settings.darkMode = true;
            }
            applySettings();
            saveSettings();
    
            tg.onEvent('themeChanged', () => {
              settings.darkMode = tg.colorScheme !== 'light';
              applySettings();
              saveSettings();
            });
    
            // Populate user profile
            const u = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
            if (u) {
              showUserProfile(u, tg);
            } else {
              showFallbackProfile();
            }
    
            // Main button (BottomButton)
            // Bot API 9.5 / Mini Apps: iconCustomEmojiId sets a custom emoji icon on the BottomButton.
            // The emoji below is the 🔍 magnifying glass Telegram custom emoji ID.
            // Set this to any valid custom emoji file_id your bot has access to.
            tg.MainButton.setText('Start Bot');
            if (tg.MainButton.setIconCustomEmojiId) {
              // iconCustomEmojiId: custom emoji to display as the button icon (Bot API 9.5)
              tg.MainButton.setIconCustomEmojiId('5197687794988590111'); // 🔍 emoji
            }
            tg.MainButton.show();
            tg.MainButton.onClick(() => tg.openLink('https://t.me/TGInstantChatIDBot'));
    
            // Back button closes
            tg.BackButton.onClick(() => tg.close());
            tg.onEvent('viewportChanged', () => { if (settings.autoExpand) tg.expand(); });
          } catch (e) {
            console.log('Telegram init error:', e);
            showFallbackProfile();
          }
        }
    
        function haptic(kind = 'light') {
          try {
            if (!settings.hapticFeedback) return;
            const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
            if (tg && tg.HapticFeedback) {
              tg.HapticFeedback.impactOccurred(kind);
            }
          } catch (e) {}
        }
    
        // Profile helpers
        function setAvatar(user) {
          const avatar = document.getElementById('userAvatar');
          const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'T';
          const initial = full.charAt(0).toUpperCase();

          // WebAppUser.photo_url: user's profile photo URL (added in recent Mini Apps update)
          if (user.photo_url) {
            const img = document.createElement('img');
            img.src = user.photo_url;
            img.alt = initial;
            img.className = 'w-full h-full object-cover rounded-full';
            img.onerror = function() {
              avatar.innerHTML = '<span class="select-none">' + initial + '</span>';
            };
            avatar.innerHTML = '';
            avatar.appendChild(img);
          } else {
            avatar.innerHTML = '<span class="select-none">' + initial + '</span>';
          }
        }

        function showUserProfile(user, tg) {
          if (!settings.showProfile) return;
          const el = document.getElementById('userProfile');
          el.classList.remove('hidden');
          const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'Telegram User';

          setAvatar(user);

          document.getElementById('userName').textContent = full;
          document.getElementById('userInfo').textContent = user.username ? '@' + user.username : 'No public username';
          document.getElementById('userId').textContent = user.id || '-';
          document.getElementById('userPremium').textContent = user.is_premium ? '⭐ Yes' : 'No';
          document.getElementById('userLanguage').textContent = (tg && tg.languageCode) || 'en';
          document.getElementById('userPlatform').textContent = (tg && tg.platform) || 'Unknown';

          // Premium visual upgrades
          if (user.is_premium) {
            document.getElementById('userPremiumBadge').classList.remove('hidden');
            const lbl = document.getElementById('userPremiumLabel');
            if (lbl) lbl.classList.remove('hidden');
            // Golden avatar ring for premium
            document.getElementById('userAvatar').classList.add('ring-amber-400/60');
            document.getElementById('userAvatar').classList.remove('ring-white/10');
          }
        }
    
        function showFallbackProfile() {
          if (!settings.showProfile) return;
          const el = document.getElementById('userProfile');
          el.classList.remove('hidden');
          document.getElementById('userAvatar').innerHTML = '<span class="select-none">W</span>';
          document.getElementById('userName').textContent = 'Web User';
          document.getElementById('userInfo').textContent = 'Open via Telegram for full profile';
          document.getElementById('userId').textContent = '—';
          document.getElementById('userPremium').textContent = 'No';
          document.getElementById('userLanguage').textContent = navigator.language || 'en';
          document.getElementById('userPlatform').textContent = 'Web Browser';
        }
    
        // Events
        document.addEventListener('DOMContentLoaded', () => {
          mountIcons();
          loadSettings();
          applySettings();
          mountReveal();
          mountTelegram();
    
          // FAB open
          document.getElementById('fab').addEventListener('click', () => {
            haptic('medium');
            openSettings();
          });
          // Close
          document.getElementById('overlay').addEventListener('click', closeSettings);
          document.getElementById('closeSettings').addEventListener('click', closeSettings);
    
          // Switch handlers
          const bindSwitch = (id, key) => {
            const el = document.getElementById(id);
            setSwitch(el, !!settings[key]);
            el.addEventListener('click', () => {
              const next = !(el.getAttribute('aria-checked') === 'true');
              setSwitch(el, next);
              settings[key] = next;
              saveSettings();
              applySettings();
              haptic('light');
              showToast('Settings updated', 'success');
            });
          };
          bindSwitch('darkModeToggle', 'darkMode');
          bindSwitch('hapticToggle', 'hapticFeedback');
          bindSwitch('autoExpandToggle', 'autoExpand');
          bindSwitch('showProfileToggle', 'showProfile');
    
          // Reset
          document.getElementById('resetSettings').addEventListener('click', () => {
            settings.darkMode = true;
            settings.hapticFeedback = true;
            settings.autoExpand = true;
            settings.showProfile = true;
            saveSettings();
            applySettings();
            haptic('medium');
            showToast('Settings restored', 'success');
          });
    
          // CTA button loading state
          const startBtn = document.getElementById('startBotBtn');
          const spinner = document.getElementById('loadingSpinner');
          const btnText = document.getElementById('buttonText');
          startBtn.addEventListener('click', () => {
            haptic('medium');
            spinner.classList.remove('hidden');
            btnText.textContent = 'Opening...';
            setTimeout(() => {
              spinner.classList.add('hidden');
              btnText.textContent = 'Start Using Bot';
            }, 1600);
          });
    
          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
              e.preventDefault();
              openSettings();
            }
            if (e.key === 'Escape') closeSettings();
          });
        });
      </script>
    </body>
    </html>`;
}

// Main handler function
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle GET requests for the home page
  if (request.method === 'GET') {
    return new Response(createHomePage(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  }

  // Only handle POST requests for Telegram updates
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get the request body
    const content = await request.text();
    const update = JSON.parse(content);

    logError(`Received update: ${JSON.stringify(update, null, 2)}`);

    // Exit if no update received from Telegram Bots API
    if (!update) {
      logError(`No valid update received: ${JSON.stringify(update)}`);
      return new Response('OK', { status: 200 });
    }

    // Handle callback queries (inline button clicks)
    if (update.callback_query) {
      return handleCallbackQuery(update.callback_query);
    }

    // Handle inline queries
    if (update.inline_query) {
      return handleInlineQuery(update.inline_query);
    }

    // Handle pre-checkout queries (payment validation)
    if (update.pre_checkout_query) {
      await handlePreCheckout(update.pre_checkout_query);
      return new Response('OK', { status: 200 });
    }

    // Handle successful payments
    if (update.message && update.message.successful_payment) {
      const payment = update.message.successful_payment;
      const chat_id = update.message.chat.id;

      const success_text = "🎉 <b>Thank you for your donation!</b>\n\n" +
        "💝 <b>Payment Details:</b>\n" +
        `• Amount: ${payment.total_amount} ${payment.currency}\n` +
        `• Transaction ID: <code>${payment.telegram_payment_charge_id}</code>\n\n` +
        "🌟 <b>Your support means the world to us!</b>\n" +
        "We'll use your donation to improve the bot and add new features.\n\n" +
        "<blockquote>Thank you for being awesome! 🙏</blockquote>";

      await sendHTMLMessage(BOT_TOKEN, chat_id, success_text, null, true);
      return new Response('OK', { status: 200 });
    }

    // Handle regular messages
    if (!update.message) {
      logError(`No message in update: ${JSON.stringify(update)}`);
      return new Response('OK', { status: 200 });
    }

    const message = update.message;
    const chat_id = message.chat.id;
    const text = message.text || '';

    logError(`Processing message: "${text}" from chat: ${chat_id}`);
    logError(`Message object: ${JSON.stringify(message, null, 2)}`);

    // Start Message Handling
    if (text.startsWith('/start')) {
      logError(`Processing start command: "${text}"`);
      // Check if it's a link command
      if (text.includes('link_')) {
        const link_id = text.replace('/start link_', '');
        logError(`Link command received for ID: ${link_id}`);

        // Determine if it's a user ID or chat ID based on the format
        const isUser = /^\d+$/.test(link_id) && !link_id.startsWith('-100');
        const isChat = /^-100\d+$/.test(link_id);

        if (isUser) {
          // It's a user ID
          logError(`Processing user ID: ${link_id}`);
          const user_response = `👤 <b>User Information</b>\n🆔 ID: <code>${link_id}</code>\n\n📱 <b>Quick Links:</b>\n• <a href="tg://openmessage?user_id=${link_id}">📱 Android</a>\n• <a href="tg://user?id=${link_id}">🍎 iOS</a>\n\n🔗 <b>Direct Links:</b>\n• Android: <code>tg://openmessage?user_id=${link_id}</code>\n• iOS: <code>tg://user?id=${link_id}</code>`;
          logError(`Sending user response with embedded links for user ID: ${link_id}`);
          await sendHTMLMessage(BOT_TOKEN, chat_id, user_response, null, false, null);
        } else if (isChat) {
          // It's a chat ID
          const chat_response = `💬 <b>Chat Information</b>\n🆔 ID: <code>${link_id}</code>\n\n🔗 <b>Quick Link:</b>\n• <a href="https://t.me/c/${String(link_id).replace('-100', '')}/10000000">🔗 Open in Telegram</a>\n\n🔗 <b>Direct Link:</b>\n• Telegram: <code>https://t.me/c/${String(link_id).replace('-100', '')}/10000000</code>`;
          await sendHTMLMessage(BOT_TOKEN, chat_id, chat_response, null, false, null);
        } else {
          // Invalid ID format
          await sendHTMLMessage(BOT_TOKEN, chat_id, "❌ Invalid ID format. Please try again.", null, true);
        }
        return new Response('OK', { status: 200 });
      }

      // Regular /start command (only if it's exactly /start)
      if (text === '/start') {
        const reply_text =
          "🆔 <b>Chat ID Finder Bot</b>\n" +
          "<i>Your instant Telegram ID lookup tool — fast, free & reliable.</i>\n\n" +
          "<b>What can I do?</b>\n" +
          "🔹 Reveal IDs for any user, bot, group or channel\n" +
          "🔹 Generate direct Android & iOS deep links\n" +
          "🔹 Works on public <i>and</i> private chats\n" +
          "🔹 Forward any message to identify who sent it\n\n" +
          "<b>⚡ Quick Start</b>\n" +
          "Just tap one of the buttons below — share a contact or chat and I'll reveal its ID in seconds!\n\n" +
          "<blockquote>Made with ❤️ by @Ashlynn_Repository · Built on Cloudflare Workers</blockquote>";

        // Define All The Keyboard Buttons With Custom Formation
        // Bot API 9.4: style field colors buttons — primary (blue), success (green)
        const keyboard = {
          keyboard: [
            // Row 1: User button — primary (blue) as main action
            [
              { text: '👤 Get User ID', request_user: { request_id: 1, user_is_bot: false }, style: 'primary' }
            ],
            // Row 2: Public Group and Private Group
            [
              {
                text: '🌐 Public Group', request_chat: {
                  request_id: 5,
                  chat_is_channel: false,
                  chat_has_username: true
                },
                style: 'primary'
              },
              {
                text: '🔒 Private Group', request_chat: {
                  request_id: 3,
                  chat_is_channel: false,
                  chat_has_username: false
                }
              }
            ],
            // Row 3: Public Channel and Private Channel
            [
              {
                text: '📢 Public Channel', request_chat: {
                  request_id: 4,
                  chat_is_channel: true,
                  chat_has_username: true
                },
                style: 'primary'
              },
              {
                text: '🔒 Private Channel', request_chat: {
                  request_id: 2,
                  chat_is_channel: true,
                  chat_has_username: false
                }
              }
            ],
            // Row 4: Bots and Premium User
            [
              { text: '🤖 Get Bot ID', request_user: { request_id: 6, user_is_bot: true } },
              { text: '⭐ Premium User', request_user: { request_id: 7, user_is_premium: true }, style: 'success' }
            ]
          ],
          resize_keyboard: true,  // Adjusts keyboard size for better fit
          one_time_keyboard: false  // Keyboard persists after use
        };

        // Send the welcome message with both keyboards and fire effect
        await sendHTMLMessage(BOT_TOKEN, chat_id, reply_text, keyboard, true, START_EFFECT_ID);
      }
    }

    // Handle /help command
    else if (text === '/help') {

      const help_text =
        "📖 <b>Help Center</b>\n" +
        "<i>Everything you need to know about Chat ID Finder Bot.</i>\n\n" +
        "━━━━━━━━━━━━━━━━\n" +
        "<b>🛠 Commands</b>\n" +
        "  /start — Open the main menu & share buttons\n" +
        "  /me — See your own Telegram profile & ID\n" +
        "  /about — Learn about this bot\n" +
        "  /donate — Support via crypto\n" +
        "  /donate_stars — Donate Telegram Stars ⭐\n" +
        "━━━━━━━━━━━━━━━━\n" +
        "<b>💡 How to use</b>\n" +
        "1️⃣ Tap <b>👤 Get User ID</b> → share any user → get their ID\n" +
        "2️⃣ Tap a group/channel button → share a chat → get its ID\n" +
        "3️⃣ <b>Forward</b> any message to identify the original sender\n" +
        "4️⃣ Use the returned links to open the user directly on Android or iOS\n\n" +
        "<b>🔍 Supported types</b>\n" +
        "• Regular users  •  Bots  •  Premium users\n" +
        "• Public groups & channels\n" +
        "• Private groups & channels\n\n" +
        "<blockquote>Still stuck? Reach out → @Ashlynn_Repository</blockquote>";

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, help_text, inline_keyboard, true);
    }

    // Handle /me command
    else if (text === '/me') {
      const user = message.from;
      const user_id = user.id;
      const first_name = user.first_name || '';
      const last_name = user.last_name || '';
      const username = user.username ? `@${user.username}` : 'No username';
      const is_premium = user.is_premium ? 'Yes' : 'No';
      const is_bot = user.is_bot ? 'Yes' : 'No';
      // Bot API 9.5: sender_tag is the custom title/tag set for the user in a group
      const sender_tag = message.sender_tag || null;

      const me_text =
        `🪪 <b>Your Telegram Profile</b>\n` +
        `<i>Here's everything I can see about you.</i>\n\n` +
        `<b>🆔 User ID</b>\n<code>${user_id}</code>\n\n` +
        `<b>👤 Full Name</b>\n${first_name}${last_name ? ' ' + last_name : ''}\n\n` +
        `<b>🔗 Username</b>\n${username}\n` +
        (sender_tag ? `<b>🏷 Member Tag</b>\n<code>${sender_tag}</code>\n` : '') +
        `<b>⭐ Premium</b>  ${is_premium === 'Yes' ? '✅ Active' : '❌ No'}\n` +
        `<b>🤖 Is Bot</b>  ${is_bot === 'Yes' ? 'Yes' : 'No'}\n\n` +
        `<b>🔗 Deep Links</b>\n` +
        `<code>tg://user?id=${user_id}</code> <i>(iOS)</i>\n` +
        `<code>tg://openmessage?user_id=${user_id}</code> <i>(Android)</i>\n\n` +
        `<blockquote>Powered by @Ashlynn_Repository</blockquote>`;

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, me_text, inline_keyboard, true);
    }

    // Handle /about command
    else if (text === '/about') {
      const about_text =
        "🤖 <b>Chat ID Finder Bot</b>\n" +
        "<i>The fastest way to look up any Telegram ID.</i>\n\n" +
        "━━━━━━━━━━━━━━━━\n" +
        "<b>🎯 What it does</b>\n" +
        "Instantly reveal the unique numeric ID of any Telegram user, bot, group, or channel — with one tap.\n\n" +
        "<b>⚡ Powered by</b>\n" +
        "• Cloudflare Workers — serverless, global edge\n" +
        "• Telegram Bot API (latest version)\n" +
        "• Zero latency worldwide via CDN\n\n" +
        "<b>✨ Highlights</b>\n" +
        "• Works with ALL chat types (public & private)\n" +
        "• Animated message effects on results\n" +
        "• One-click Android & iOS deep links\n" +
        "• Forward detection & hidden user handling\n" +
        "• Telegram Mini App with live profile card\n\n" +
        "━━━━━━━━━━━━━━━━\n" +
        "<b>👨‍💻 Creator</b>\n" +
        "Built with ❤️ by <a href=\"https://t.me/Ashlynn_Repository\">@Ashlynn_Repository</a>\n" +
        "<blockquote>Open source spirit, premium quality. 🚀</blockquote>";

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, about_text, inline_keyboard, true);
    }

    // Handle /donate command
    else if (text === '/donate') {
      const donate_text = "💖 <b>Support the Bot Creator</b>\n\n" +
        "🌟 <b>Why Donate?</b>\n" +
        "Your support helps keep this bot running and enables new features!\n\n" +
        "💳 <b>Donation Options:</b>\n\n" +
        "🌍 <b>International:</b>\n" +
        "• USDT TRC20: <code>TWcX3dnUCe7W6ttWXRh2SwdkB2BuUoDqKM</code>\n" +
        "• USDT BEP20: <code>0xaf372fc0ebd385868f27b53adbdef38e8ffad372</code>\n\n" +
        "📱 <b>Contact:</b>\n" +
        "• Telegram: @Ashlynn_Repository\n" +
        "• Email: aarabhofficial@pm.me\n\n" +
        "<blockquote>Every donation counts! Thank you! 🙏</blockquote>";

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, donate_text, inline_keyboard, true);
    }

    // Handle /donate_stars command
    else if (text === '/donate_stars') {
      await sendInvoice(chat_id);
    }

    // Handle /test command for debugging
    else if (text === '/test') {
      const test_text = "🧪 <b>Bot Test</b>\n\n" +
        "✅ Bot is working properly!\n" +
        "🔧 All systems operational\n" +
        "📱 Message sending: OK\n" +
        "🎯 Inline buttons: OK\n\n" +
        "<blockquote>Bot is ready to use! 🚀</blockquote>";

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, test_text, inline_keyboard, true);
    }


    // Handle /refund command (Admin only)
    else if (text.startsWith('/refund')) {
      const user_id = message.from.id;

      // Check if user is admin
      if (user_id.toString() !== BOT_CONFIG.ADMIN_ID.toString()) {
        const not_admin_text = "❌ <b>Access Denied</b>\n\n" +
          "🔒 <b>This command is admin-only!</b>\n\n" +
          "💡 <b>Need a refund?</b>\n" +
          "• Contact @Ashlynn_Repository directly\n" +
          "• Provide your transaction details\n" +
          "• We'll process it for you\n\n" +
          "📧 <b>Contact:</b>\n" +
          "• Telegram: @Ashlynn_Repository\n" +
          "• Email: aarabhofficial@pm.me\n\n" +
          "<blockquote>Only administrators can process refunds directly.</blockquote>";

        const inline_keyboard = createInlineKeyboard();
        await sendHTMLMessage(BOT_TOKEN, chat_id, not_admin_text, inline_keyboard, true);
        return new Response('OK', { status: 200 });
      }

      // Admin access granted - check command format
      const args = text.split(' ');

      if (args.length === 1) {
        // Show usage instructions
        const usage_text = "💰 <b>Admin Refund System</b>\n\n" +
          "🔧 <b>Command Usage:</b>\n" +
          "<code>/refund user_id transaction_id</code>\n\n" +
          "📋 <b>Parameters:</b>\n" +
          "• <code>user_id</code> - The user's Telegram ID\n" +
          "• <code>transaction_id</code> - The payment charge ID\n\n" +
          "💡 <b>Example:</b>\n" +
          "<code>/refund 123456789 987654321</code>\n\n" +
          "⚠️ <b>Important:</b>\n" +
          "• Only use for legitimate refunds\n" +
          "• Verify transaction details first\n" +
          "• Keep records of all refunds\n\n" +
          "<blockquote>Admin access granted ✅</blockquote>";

        const inline_keyboard = createInlineKeyboard();
        await sendHTMLMessage(BOT_TOKEN, chat_id, usage_text, inline_keyboard, true);
        return new Response('OK', { status: 200 });
      }

      if (args.length < 3) {
        logError('Invalid refund command format');
        const error_text = "❌ <b>Invalid Command Format</b>\n\n" +
          "📋 <b>Correct Usage:</b>\n" +
          "<code>/refund user_id transaction_id</code>\n\n" +
          "💡 <b>Example:</b>\n" +
          "<code>/refund 123456789 987654321</code>\n\n" +
          "🔍 <b>What you need:</b>\n" +
          "• User's Telegram ID\n" +
          "• Payment transaction ID\n\n" +
          "<blockquote>Please provide both parameters.</blockquote>";

        await sendHTMLMessage(BOT_TOKEN, chat_id, error_text, null, false, null);
        return new Response('Invalid refund command', { status: 200 });
      }

      // Process the refund
      const refundUserId = args[1];
      const chargeId = args[2];

      logError(`Admin refund request: user_id=${refundUserId}, charge_id=${chargeId}`);

      const processing_text = "⏳ <b>Processing Refund...</b>\n\n" +
        "📋 <b>Details:</b>\n" +
        `• User ID: <code>${refundUserId}</code>\n` +
        `• Transaction ID: <code>${chargeId}</code>\n\n` +
        "🔄 <b>Status:</b> Contacting Telegram API...";

      await sendHTMLMessage(BOT_TOKEN, chat_id, processing_text, null, false, null);
      await processRefund(chat_id, refundUserId, chargeId);
    }

    // Handle shared user (User, Bots, or Premium User)
    if (message.user_shared) {
      logError(`=== USER_SHARED DETECTED ===`);
      logError(`Full user_shared object: ${JSON.stringify(message.user_shared, null, 2)}`);
      logError(`Processing user_shared: ${JSON.stringify(message.user_shared)}`);

      const request_id = message.user_shared.request_id;
      const user_id = message.user_shared.user_id;

      logError(`User shared - request_id: ${request_id}, user_id: ${user_id}`);

      if (!request_id || !types[request_id]) {
        logError(`Invalid or missing request_id for user_shared: ${JSON.stringify(message.user_shared)}`);
        const response = "⚠️ <b>Error:</b> Invalid user type shared.";
        const inline_keyboard = createInlineKeyboard();
        await sendHTMLMessage(BOT_TOKEN, chat_id, response, inline_keyboard);
      } else {
        const type = types[request_id].name;
        const effect_id = types[request_id].effect_id;

        if (!user_id || user_id === 'Unknown') {
          logError(`Missing or invalid user_id in user_shared for request_id ${request_id}: ${JSON.stringify(message.user_shared)}`);
          const response = `⚠️ <b>Error:</b> Unable to retrieve ${type} ID.`;
          const inline_keyboard = createInlineKeyboard();
          await sendHTMLMessage(BOT_TOKEN, chat_id, response, inline_keyboard, false, effect_id);
        } else {
          const response = `👤 <b>Shared ${type} Info</b>\n🆔 ID: <code>${user_id}</code>`;

          // Create inline keyboard with Android/iOS links
          // Bot API 9.4: style field applied for visual distinction
          const link_keyboard = {
            inline_keyboard: [
              [
                { text: '📱 Open on Android', url: `tg://openmessage?user_id=${user_id}`, style: 'primary' },
                { text: '🍎 Open on iOS', url: `tg://user?id=${user_id}`, style: 'primary' }
              ],
              [
                { text: '⭐ Donate Stars', callback_data: 'donate_stars', style: 'success' },
                { text: '💖 Donate Money', callback_data: 'donate_money', style: 'success' }
              ]
            ]
          };

          logError(`Sending user info for ${type} with user_id: ${user_id}, effect_id: ${effect_id}`);

          // Try sending with effect, fallback without effect if it fails
          let messageSent = await sendHTMLMessage(BOT_TOKEN, chat_id, response, link_keyboard, false, effect_id);
          if (!messageSent) {
            logError(`Retrying without message_effect_id for ${type} (chat_id: ${chat_id}, user_id: ${user_id})`);
            messageSent = await sendHTMLMessage(BOT_TOKEN, chat_id, response, link_keyboard, false, null);
          }

          if (!messageSent) {
            logError(`Failed to send message for ${type} (chat_id: ${chat_id}, user_id: ${user_id})`);

            // Fallback: Send with embedded HTML links and plain text links
            const fallback_response = `👤 <b>Shared ${type} Info</b>\n🆔 ID: <code>${user_id}</code>\n\n📱 <b>Quick Links:</b>\n• <a href="tg://openmessage?user_id=${user_id}">📱 Android</a>\n• <a href="tg://user?id=${user_id}">🍎 iOS</a>\n\n🔗 <b>Direct Links:</b>\n• Android: <code>tg://openmessage?user_id=${user_id}</code>\n• iOS: <code>tg://user?id=${user_id}</code>\n\n🔗 <b>Alternative:</b>\n• <a href="https://t.me/TGInstantChatIDBot?start=link_${user_id}">🔗 Get User Info</a>`;

            logError(`Sending fallback message with embedded links for ${type} with user_id: ${user_id}`);
            await sendHTMLMessage(BOT_TOKEN, chat_id, fallback_response, null, false, null);
          }
        }
      }
    }

    // Handle forwarded messages - Enhanced for all Telegram entities
    if (message.forward_from || message.forward_from_chat || message.forward_origin) {
      logError(`=== FORWARDED MESSAGE DETECTED ===`);
      logError(`Forward details: forward_from=${!!message.forward_from}, forward_from_chat=${!!message.forward_from_chat}, forward_origin=${!!message.forward_origin}`);
      // Bot API 9.5: sender_tag is the custom member title/tag in the originating group/channel
      const msg_sender_tag = message.sender_tag || null;

      // Handle different types of forwarded messages
      if (message.forward_origin) {
        // New forward_origin format (Telegram API 6.0+)
        const origin = message.forward_origin;
        const forward_date = message.forward_date ? new Date(message.forward_date * 1000).toLocaleString() : 'Unknown';

        logError(`Forward origin type: ${origin.type}`);

        switch (origin.type) {
          case 'user':
            // Forwarded from a user
            const user = origin.sender_user;
            if (user) {
              const user_id = user.id;
              const first_name = user.first_name || '';
              const last_name = user.last_name || '';
              const username = user.username ? '@' + user.username : 'No username';
              const is_premium = user.is_premium ? 'Yes' : 'No';
              const is_bot = user.is_bot ? 'Yes' : 'No';
              // Bot API 9.5: include sender_tag (member tag) if present
              const tag_line = msg_sender_tag ? "\n🏷 Tag: <code>" + msg_sender_tag + "</code>" : '';

              const forward_response = "👤 <b>Forwarded User Info</b>\n🆔 ID: <code>" + user_id + "</code>\n📝 Name: " + first_name + " " + last_name + "\n🔗 Username: " + username + tag_line + "\n⭐ Premium: " + is_premium + "\n🤖 Bot: " + is_bot + "\n📅 Forwarded: " + forward_date + "\n\n📱 <b>Quick Links:</b>\n• <a href=\"tg://openmessage?user_id=" + user_id + "\">📱 Android</a>\n• <a href=\"tg://user?id=" + user_id + "\">🍎 iOS</a>\n\n🔗 <b>Direct Links:</b>\n• Android: <code>tg://openmessage?user_id=" + user_id + "</code>\n• iOS: <code>tg://user?id=" + user_id + "</code>";

              logError("Sending forwarded user info for user_id: " + user_id);
              await sendHTMLMessage(BOT_TOKEN, chat_id, forward_response, null, false, null);
            }
            break;

          case 'chat':
            // Forwarded from a chat/group
            const chat = origin.sender_chat;
            if (chat) {
              const chat_id = chat.id;
              const title = chat.title || 'No title';
              const username = chat.username ? '@' + chat.username : 'No username';
              const type = chat.type || 'Unknown';

              let chat_type_emoji = '💬';
              let chat_type_name = 'Chat';

              switch (type) {
                case 'group':
                  chat_type_emoji = '👥';
                  chat_type_name = 'Group';
                  break;
                case 'supergroup':
                  chat_type_emoji = '👥';
                  chat_type_name = 'Supergroup';
                  break;
                case 'channel':
                  chat_type_emoji = '📢';
                  chat_type_name = 'Channel';
                  break;
              }

              const forward_response = chat_type_emoji + " <b>Forwarded " + chat_type_name + " Info</b>\n🆔 ID: <code>" + chat_id + "</code>\n📝 Title: " + title + "\n🔗 Username: " + username + "\n📋 Type: " + chat_type_name + "\n📅 Forwarded: " + forward_date + "\n\n🔗 <b>Quick Link:</b>\n• <a href=\"https://t.me/c/" + String(chat_id).replace('-100', '') + "/10000000\">🔗 Open in Telegram</a>\n\n🔗 <b>Direct Link:</b>\n• Telegram: <code>https://t.me/c/" + String(chat_id).replace('-100', '') + "/10000000</code>";

              logError("Sending forwarded chat info for chat_id: " + chat_id);
              await sendHTMLMessage(BOT_TOKEN, chat_id, forward_response, null, false, null);
            }
            break;

          case 'channel':
            // Forwarded from a channel
            const channel = origin.chat;
            if (channel) {
              const channel_id = channel.id;
              const title = channel.title || 'No title';
              const username = channel.username ? '@' + channel.username : 'No username';

              const forward_response = "📢 <b>Forwarded Channel Info</b>\n🆔 ID: <code>" + channel_id + "</code>\n📝 Title: " + title + "\n🔗 Username: " + username + "\n📋 Type: Channel\n📅 Forwarded: " + forward_date + "\n\n🔗 <b>Quick Link:</b>\n• <a href=\"https://t.me/c/" + String(channel_id).replace('-100', '') + "/10000000\">🔗 Open in Telegram</a>\n\n🔗 <b>Direct Link:</b>\n• Telegram: <code>https://t.me/c/" + String(channel_id).replace('-100', '') + "/10000000</code>";

              logError("Sending forwarded channel info for channel_id: " + channel_id);
              await sendHTMLMessage(BOT_TOKEN, chat_id, forward_response, null, false, null);
            }
            break;

          case 'hidden_user':
            // Hidden user (privacy settings enabled)
            const sender_name = message.forward_sender_name || 'Hidden User';

            const hidden_response = "🔒 <b>Hidden User Detected</b>\n\n👤 <b>Sender:</b> " + sender_name + "\n📅 <b>Forwarded:</b> " + forward_date + "\n\n⚠️ <b>User details are private!</b>\n\n💡 <b>To get this user's ID:</b>\n• Use the \"👤 User\" button below\n• Share this user's contact\n• The bot will then show the user ID\n\n🔧 <b>Why is this hidden?</b>\n• User has privacy settings enabled\n• Forwarding is restricted\n• Contact sharing is required";

            // Create keyboard with user sharing button
            // Bot API 9.4: primary style for main action button
            const hidden_keyboard = {
              keyboard: [
                [
                  { text: '👤 Share User to Get ID', request_user: { request_id: 1, user_is_bot: false }, style: 'primary' }
                ]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            };

            logError("Sending hidden user response for sender: " + sender_name);
            await sendHTMLMessage(BOT_TOKEN, chat_id, hidden_response, hidden_keyboard, false, null);
            break;

          default:
            logError("Unknown forward origin type: " + origin.type);
            await sendHTMLMessage(BOT_TOKEN, chat_id, `❓ <b>Unknown Forward Type</b>\n\nForward type: <code>${origin.type}</code>\n\nPlease try sharing the user or chat directly using the buttons below.`, null, false, null);
            break;
        }
      } else if (message.forward_from) {
        // Legacy: Forwarded from a user (old API format)
        const user = message.forward_from;
        const user_id = user.id;
        const first_name = user.first_name || '';
        const last_name = user.last_name || '';
        const username = user.username ? '@' + user.username : 'No username';
        const is_premium = user.is_premium ? 'Yes' : 'No';
        const is_bot = user.is_bot ? 'Yes' : 'No';
        const forward_date = message.forward_date ? new Date(message.forward_date * 1000).toLocaleString() : 'Unknown';

        const forward_response = "👤 <b>Forwarded User Info</b>\n🆔 ID: <code>" + user_id + "</code>\n📝 Name: " + first_name + " " + last_name + "\n🔗 Username: " + username + "\n⭐ Premium: " + is_premium + "\n🤖 Bot: " + is_bot + "\n📅 Forwarded: " + forward_date + "\n\n📱 <b>Quick Links:</b>\n• <a href=\"tg://openmessage?user_id=" + user_id + "\">📱 Android</a>\n• <a href=\"tg://user?id=" + user_id + "\">🍎 iOS</a>\n\n🔗 <b>Direct Links:</b>\n• Android: <code>tg://openmessage?user_id=" + user_id + "</code>\n• iOS: <code>tg://user?id=" + user_id + "</code>";

        logError("Sending forwarded user info for user_id: " + user_id);
        await sendHTMLMessage(BOT_TOKEN, chat_id, forward_response, null, false, null);
      } else if (message.forward_from_chat) {
        // Legacy: Forwarded from a chat/channel (old API format)
        const chat = message.forward_from_chat;
        const chat_id = chat.id;
        const title = chat.title || 'No title';
        const username = chat.username ? '@' + chat.username : 'No username';
        const type = chat.type || 'Unknown';
        const forward_date = message.forward_date ? new Date(message.forward_date * 1000).toLocaleString() : 'Unknown';

        let chat_type_emoji = '💬';
        let chat_type_name = 'Chat';

        switch (type) {
          case 'group':
            chat_type_emoji = '👥';
            chat_type_name = 'Group';
            break;
          case 'supergroup':
            chat_type_emoji = '👥';
            chat_type_name = 'Supergroup';
            break;
          case 'channel':
            chat_type_emoji = '📢';
            chat_type_name = 'Channel';
            break;
        }

        const forward_response = chat_type_emoji + " <b>Forwarded " + chat_type_name + " Info</b>\n🆔 ID: <code>" + chat_id + "</code>\n📝 Title: " + title + "\n🔗 Username: " + username + "\n📋 Type: " + chat_type_name + "\n📅 Forwarded: " + forward_date + "\n\n🔗 <b>Quick Link:</b>\n• <a href=\"https://t.me/c/" + String(chat_id).replace('-100', '') + "/10000000\">🔗 Open in Telegram</a>\n\n🔗 <b>Direct Link:</b>\n• Telegram: <code>https://t.me/c/" + String(chat_id).replace('-100', '') + "/10000000</code>";

        logError("Sending forwarded chat info for chat_id: " + chat_id);
        await sendHTMLMessage(BOT_TOKEN, chat_id, forward_response, null, false, null);
      }
    }

    // Handle shared chat (Private/Public Channel/Group)
    if (message.chat_shared) {
      logError(`=== CHAT_SHARED DETECTED ===`);
      logError(`Full chat_shared object: ${JSON.stringify(message.chat_shared, null, 2)}`);
      logError(`Processing chat_shared: ${JSON.stringify(message.chat_shared)}`);

      const request_id = message.chat_shared.request_id;
      const shared_id = message.chat_shared.chat_id;

      logError(`Chat shared - request_id: ${request_id}, chat_id: ${shared_id}`);

      if (!request_id || !types[request_id]) {
        logError(`Invalid or missing request_id for chat_shared: ${JSON.stringify(message.chat_shared)}`);
        const response = "⚠️ <b>Error:</b> Invalid chat type shared.";
        const inline_keyboard = createInlineKeyboard();
        await sendHTMLMessage(BOT_TOKEN, chat_id, response, inline_keyboard);
      } else {
        const type = types[request_id].name;
        const effect_id = types[request_id].effect_id;

        if (!shared_id || shared_id === 'Unknown') {
          logError(`Missing or invalid chat_id in chat_shared for request_id ${request_id}: ${JSON.stringify(message.chat_shared)}`);
          const response = `⚠️ <b>Error:</b> Unable to retrieve ${type} ID.`;
          const inline_keyboard = createInlineKeyboard();
          await sendHTMLMessage(BOT_TOKEN, chat_id, response, inline_keyboard, false, effect_id);
        } else {
          const response = `💬 <b>Shared ${type} Info</b>\n🆔 ID: <code>${shared_id}</code>`;

          // Create inline keyboard with universal Telegram link for chats
          // Bot API 9.4: style field applied for visual distinction
          const chat_id_clean = String(shared_id).replace('-100', '');
          const link_keyboard = {
            inline_keyboard: [
              [
                { text: '🔗 Open in Telegram', url: `https://t.me/c/${chat_id_clean}/10000000`, style: 'primary' }
              ],
              [
                { text: '⭐ Donate Stars', callback_data: 'donate_stars', style: 'success' },
                { text: '💖 Donate Money', callback_data: 'donate_money', style: 'success' }
              ]
            ]
          };

          logError(`Sending chat info for ${type} with chat_id: ${shared_id}, effect_id: ${effect_id}`);

          let messageSent = await sendHTMLMessage(BOT_TOKEN, chat_id, response, link_keyboard, false, effect_id);
          if (!messageSent) {
            logError(`Retrying without message_effect_id for ${type} (chat_id: ${chat_id}, shared_id: ${shared_id})`);
            messageSent = await sendHTMLMessage(BOT_TOKEN, chat_id, response, link_keyboard, false, null);
          }

          if (!messageSent) {
            logError(`Failed to send message for ${type} (chat_id: ${chat_id}, shared_id: ${shared_id})`);

            const fallback_response = `💬 <b>Shared ${type} Info</b>\n🆔 ID: <code>${shared_id}</code>\n\n🔗 <b>Quick Link:</b>\n• <a href="https://t.me/c/${String(shared_id).replace('-100', '')}/10000000">🔗 Open in Telegram</a>\n\n🔗 <b>Direct Link:</b>\n• Telegram: <code>https://t.me/c/${String(shared_id).replace('-100', '')}/10000000</code>\n\n🔗 <b>Alternative:</b>\n• <a href="https://t.me/TGInstantChatIDBot?start=link_${shared_id}">🔗 Get Chat Info</a>`;

            logError(`Sending fallback message with embedded links for ${type} with chat_id: ${shared_id}`);
            await sendHTMLMessage(BOT_TOKEN, chat_id, fallback_response, null, false, null);
          }
        }
      }
    }

    // Handle any other messages (non-commands)
    if (text && !text.startsWith('/') && !message.user_shared && !message.chat_shared && !message.forward_from && !message.forward_from_chat && !message.forward_origin) {
      const default_response =
        `👋 <b>Hey there!</b>\n` +
        `<i>Looks like you sent me a text — but I'm designed to look up IDs, not chat! 😄</i>\n\n` +
        `<b>Here's what I can do for you →</b>\n` +
        `🔹 <b>/start</b> — Open the share buttons & get any ID\n` +
        `🔹 <b>/me</b> — See your own profile & ID\n` +
        `🔹 <b>/help</b> — Full guide and tips\n` +
        `🔹 <b>Forward</b> any message to me — I'll identify the sender\n\n` +
        `<blockquote>Tap /start and let's go! 🚀</blockquote>`;

      const inline_keyboard = createInlineKeyboard();
      await sendHTMLMessage(BOT_TOKEN, chat_id, default_response, inline_keyboard, true);
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    logError(`Error processing request: ${error.message}`);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Export the handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};
