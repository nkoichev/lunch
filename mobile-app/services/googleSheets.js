import axios from 'axios';

// Update this with your backend server URL
// For local development: 'http://YOUR_COMPUTER_IP:3001'
// For production: your deployed backend URL
const BACKEND_URL = 'http://10.0.0.30:3001'; // Change to your computer's IP address

/**
 * Fetch lunch orders from Google Sheets via backend proxy
 * @returns {Promise<{orders: Array, summary: Array}>}
 */
export async function fetchLunchOrders() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/orders`, {
      timeout: 10000, // 10 second timeout
    });

    if (response.data) {
      return {
        orders: response.data.orders || [],
        summary: response.data.summary || []
      };
    }

    throw new Error('No data received from server');
  } catch (error) {
    console.error('Error fetching lunch orders:', error);

    if (error.code === 'ECONNABORTED') {
      throw new Error('Заявката отне твърде много време. Проверете интернет връзката.');
    } else if (error.response) {
      // Server responded with error
      throw new Error(`Грешка от сървъра: ${error.response.status}`);
    } else if (error.request) {
      // No response received
      throw new Error('Няма връзка със сървъра. Уверете се, че backend сървърът работи.');
    } else {
      throw new Error(error.message || 'Неизвестна грешка');
    }
  }
}

/**
 * Fetch last modified time of the spreadsheet
 * @returns {Promise<string>}
 */
export async function fetchLastModified() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/last-modified`, {
      timeout: 5000,
    });

    if (response.data && response.data.modifiedTime) {
      const date = new Date(response.data.modifiedTime);
      return date.toLocaleString('bg-BG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return null;
  } catch (error) {
    console.error('Error fetching last modified time:', error);
    return null;
  }
}

/**
 * Check if backend server is healthy
 * @returns {Promise<boolean>}
 */
export async function checkServerHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 3000,
    });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}
