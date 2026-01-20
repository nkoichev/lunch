const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Google Sheets configuration
const SPREADSHEET_ID = '1Uj_mn4WmRdeHeB51--az4bq7-sOZuVBDJZH-xlnPOeQ';

const serviceAccountCredentials = {
  type: "service_account",
  project_id: "lunch-389713",
  private_key_id: "1278fbf76e91543bb7d8ac9ae25e621b46ecfe11",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWfBLHSb1oZuUc\nQKYl7q6+kqPdMU1ENXEZ0jCuzC8MtvHpkvHDwSuD32/el4fmR4FiwJ7ltKTFXzDH\nQmFifoO2lrNTVZaoaEEgC1GwGxb8J0ZlVnpqKjrJPHLjuPYcZaams1DqsIBVVsFG\nK0ElqEnLkUBindhZUR8vtycnAbfV1TMAOQYrwPQwEMrVtCizlx+gpXQxBTA9xoMF\nulK7NdBKM2mrsUACj7j2fVqqwFGyWcqazXm9y/L5/SWphNPTgfTk0ndBmrDcyoJW\niHRPSm9pOlzVJm5lpIXyjo6akyzWTX3z8BuIZTBcaBlmo8SGueXTX1mGjPoZFqzk\nmzEPV+7rAgMBAAECggEAYWeOVZ/Y2yljYe3AJpjbFePdc+3YY6ILf4jzn+ZNda49\ndXBMyDQZMXXOxZ02U+9kRHcqkjHz5EiDC/LK7CJ9aXXN8Yn8dfWGoelSCzJ6QUAK\n2amoxT7xXINNv7o3VpUZVjo4BKTsWxUfh+DL4LCo9sA7p618W6+aBJ7eMno2xO4N\nMR5vjVWlsDFQpE2Hu8wrUAZPp6ChOcqJhfC8MTbXDr2ZvmQm/NkauTeRnzm1Itr5\n7qUoFm03+eEiiwgFzQ9ic0n8dG0CbY3YjSKKDKFZsHfin8QMARCJCtGxvV85KDqG\nIA+6equkq8XOSk53i28pbxORTe1YtpNS9bGuD+LHrQKBgQDuxCRwxOVkkXuEOM9a\n6erAaFrz4NiqmiypbzIoFHa2DolREJVZyezo7380OM3RwaP/41Xu0Qrpz8qhOdHK\ngvX5D8XQXh7+FH86NC+OGzfXiwVqgf1YszTWfGlmuX6Nktu0RvqegntAc59beW96\n7hnSDwa9cSLdpSQj1rWOfEM/DwKBgQDl90N6JDvMQsr+QJlVqWbPrpBbLmx7xzi2\nGUV5a1uPY1vRpxz4ofFGMxb738WSRymABm598c4EJSJqhwNRurZvnDmBmigFSE6I\nPr1jXIANYMI3NCsGvyy1nxKwISuMid8VRdilvj3KHqIyx8KQouBdjEgx5Q9t7Aky\nDhORm48SZQKBgQDnGr7S0CHg59gQMRSzQLrSJa/zYm0VJEmabmCz3qrQqN1Ms6p7\n0DEZfcc3+sts/esJYTfqAjh3+4J774UaaQxAWH31o0SIVbqX0a898yZn4M4LO2rH\nEh5QhPdYUK8nxUAXDKTEDDPUPJXAapf2+sPPSHATqZA/zPpgHhB5q9lDDQKBgQCQ\nAr1l8uTjsHxQpoGfjFtO+YF7KGJVTVgtaTwBooKPE+i/LQjOhxOCI6JkDyk5xoit\nnNl6039xRxP7ZBtnBicTU+ELUU94p2ROnAOcAqRKPGrDiU7chcHo5vocBFmyQ/DI\n8JmQicdGGNL4O/KTAvzAeIYJgOmdq6/CgeAtUh5RpQKBgBdve6JyR0Om5zjWv5z8\nflns7DjTVYP+lIiI5FYmvfhKZs9kKjZlQa+ghDBIP2mnf7lhA8vLi8gICgksuXc3\nb6EBvT0SBwHZEBzF9Yd4XiQzK7o37oN1xoq9b/zRWT+RmoLrxKOq6pyGjs2PhcON\nLziRn2noDkuserckJLB6CLnW\n-----END PRIVATE KEY-----\n",
  client_email: "lunch2@lunch-389713.iam.gserviceaccount.com",
  client_id: "114449629195093564910",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/lunch2%40lunch-389713.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

// Helper function to parse numeric values
function parseNumeric(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Get last modified time
app.get('/api/last-modified', async (req, res) => {
  try {
    const response = await drive.files.get({
      fileId: SPREADSHEET_ID,
      fields: 'modifiedTime'
    });
    res.json({ modifiedTime: response.data.modifiedTime });
  } catch (error) {
    console.error('Error fetching last modified time:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders data
app.get('/api/orders', async (req, res) => {
  try {
    // Fetch Orders sheet
    const ordersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A4:I', // Starting from row 4 to skip headers
    });

    const rows = ordersResponse.data.values || [];

    // Parse orders
    const orders = rows
      .filter(row => row.length > 0 && row[0]) // Filter out empty rows
      .map(row => ({
        Client: row[0] || '',
        restorant: row[1] || '',
        desc: row[2] || '',
        price: parseNumeric(row[3]),
        disc_price: parseNumeric(row[4]),
        quant: parseNumeric(row[5]),
        total: parseNumeric(row[6])
      }))
      .filter(order => order.Client && order.Client !== 'total'); // Filter out total row

    // Calculate summary by client
    const summaryMap = {};
    orders.forEach(order => {
      if (!summaryMap[order.Client]) {
        summaryMap[order.Client] = 0;
      }
      summaryMap[order.Client] += order.total;
    });

    const summary = Object.entries(summaryMap)
      .map(([Client, total]) => ({ Client, total }))
      .sort((a, b) => a.Client.localeCompare(b.Client, 'bg'));

    res.json({ orders, summary });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET http://localhost:${PORT}/api/health`);
  console.log(`  - GET http://localhost:${PORT}/api/orders`);
  console.log(`  - GET http://localhost:${PORT}/api/last-modified`);
});
