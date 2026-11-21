import { STORE_SETTINGS } from '../data/products';

/**
 * Sends real-time order alerts directly to the store manager's Telegram bot & chat
 * @param {Object} order - Complete order payload
 * @returns {Promise<{success: boolean, response?: any, error?: any}>}
 */
export async function sendOrderTelegramNotification(order) {
  let telegramBotToken = STORE_SETTINGS.telegramBotToken;
  let telegramChatId = STORE_SETTINGS.telegramChatId;
  const storeName = STORE_SETTINGS.storeName;

  try {
    const saved = localStorage.getItem('tajwatch_store_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.telegramBotToken) telegramBotToken = parsed.telegramBotToken;
      if (parsed.telegramChatId) telegramChatId = parsed.telegramChatId;
    }
  } catch {
    // fallback to STORE_SETTINGS
  }

  if (!telegramBotToken || !telegramChatId) {
    console.warn('Telegram bot credentials not configured in STORE_SETTINGS.');
    return { success: false, error: 'Credentials missing' };
  }

  const itemsList = (order.items || [])
    .map(
      (item, idx) =>
        `  ${idx + 1}. <b>${item.name}</b>\n     ▫️ পরিমাণ: ${item.quantity} টি | দাম: ৳${item.price.toLocaleString('en-IN')}${
          item.selectedColor ? ` | কালার: ${item.selectedColor}` : ''
        }`
    )
    .join('\n');

  const zoneText =
    order.deliveryZone === 'outside_dhaka'
      ? 'ঢাকার বাইরে (৳150)'
      : 'ঢাকার ভিতরে (৳80)';

  const paymentText =
    order.paymentMethod === 'bkash_nagad'
      ? `📱 বিকাশ / নগদ (ম্যানুয়াল পে) — TrxID: <code>${order.transactionId || 'NOT PROVIDED'}</code>`
      : '💵 ক্যাশ অন ডেলিভারি (Cash on Delivery)';

  const messageText = `
👑 <b>নতুন অর্ডার নোটিফিকেশন — ${storeName}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>অর্ডার আইডি:</b> <code>#${order.orderId}</code>
⏰ <b>সময়:</b> ${new Date(order.createdAt || Date.now()).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}

👤 <b>গ্রাহকের বিবরণ:</b>
  • নাম: <b>${order.customerName}</b>
  • মোবাইল: <a href="tel:${order.phone}">${order.phone}</a>
  • ঠিকানা: <b>${order.address}</b>
  • ডেলিভারি জোন: <b>${zoneText}</b>
  • স্পেশাল নোট: <i>${order.notes || 'কোনো নোট নেই'}</i>

🛍️ <b>অর্ডারকৃত ঘড়ি / প্রডাক্ট:</b>
${itemsList}

💰 <b>হিসাব বিবরণী:</b>
  • সাবটোটাল: ৳${order.subtotal?.toLocaleString('en-IN')}
  • ডেলিভারি চার্জ: ৳${order.deliveryFee?.toLocaleString('en-IN')}
  • <b>সর্বমোট প্রদেয়: ৳${order.total?.toLocaleString('en-IN')}</b>
  • পেমেন্ট মেথড: ${paymentText}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Taj Watch Automatic E-Commerce System</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error('Telegram notification error:', data);
      return { success: false, error: data.description || 'API Error' };
    }

    return { success: true, response: data };
  } catch (err) {
    console.error('Failed to send Telegram notification:', err);
    return { success: false, error: err.message };
  }
}
