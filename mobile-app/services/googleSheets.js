const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJKKe23cys8FM4vEQkmNejhCzm4ig6uXRqN6FYU3ex71YBumprsLZdFypZVHVn6t6Psg/exec';

/**
 * Fetch lunch orders from Google Sheets via Apps Script
 * @returns {Promise<{orders: Array, summary: Array}>}
 */
export async function fetchLunchOrders() {
  try {
    const response = await fetch(APPS_SCRIPT_URL);

    if (!response.ok) {
      throw new Error(`Грешка от сървъра: ${response.status}`);
    }

    const data = await response.json();

    return {
      orders: data.orders || [],
      summary: data.summary || []
    };
  } catch (error) {
    console.error('Error fetching lunch orders:', error);

    if (error.message.includes('Network request failed')) {
      throw new Error('Няма интернет връзка. Проверете мрежата.');
    }

    throw new Error(error.message || 'Неизвестна грешка');
  }
}
