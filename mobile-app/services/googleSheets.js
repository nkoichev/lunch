const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMemAOfK39uZKbRMWpCoJfSTGPtGM6Wup4VGXdqjzwmLb1Qy7eJEH2N4ro8jPFyVOekw/exec';

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
      summary: data.summary || [],
      lastModified: data.lastModified || null
    };
  } catch (error) {
    console.error('Error fetching lunch orders:', error);

    if (error.message.includes('Network request failed')) {
      throw new Error('Няма интернет връзка. Проверете мрежата.');
    }

    throw new Error(error.message || 'Неизвестна грешка');
  }
}
