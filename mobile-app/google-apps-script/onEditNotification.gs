/**
 * Google Apps Script - onEdit trigger for column K notifications
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the existing code with this script
 * 4. Save and run setupTrigger() once to create the installable trigger
 * 5. Authorize the script when prompted
 *
 * NOTE: Simple onEdit triggers cannot make external HTTP calls,
 * so we use an installable trigger via setupTrigger().
 */

/**
 * Run this function ONCE to set up the installable onEdit trigger.
 * Go to Run > setupTrigger in the Apps Script editor.
 */
function setupTrigger() {
  // Remove any existing onEdit triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onSheetEdit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new installable trigger
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  Logger.log('Trigger installed successfully!');
}

/**
 * Installable onEdit trigger - fires when any cell is edited.
 * Checks if the edit is in column K of the "Orders" sheet,
 * reads the "name|order" value, and sends a push notification.
 */
function onSheetEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;

  // Only react to edits in the "Orders" sheet, column K (column 11)
  if (sheet.getName() !== 'Orders') return;
  if (range.getColumn() !== 11) return;

  var value = range.getValue();
  if (!value || value.toString().trim() === '') return;

  // Value format is "name|order"
  var parts = value.toString().split('|');
  var name = parts[0] ? parts[0].trim() : '';
  var order = parts[1] ? parts[1].trim() : '';

  if (!name) return;

  var title = 'Нова поръчка';
  var body = order ? name + ' | ' + order : name;

  sendPushNotification(title, body);
}

/**
 * Send push notification to all registered Expo push tokens.
 * Tokens are stored in the "PushTokens" sheet.
 */
function sendPushNotification(title, body) {
  var tokens = getStoredTokens();
  if (tokens.length === 0) {
    Logger.log('No push tokens registered');
    return;
  }

  var messages = tokens.map(function(token) {
    return {
      to: token,
      sound: 'default',
      title: title,
      body: body,
      channelId: 'orders'
    };
  });

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(messages),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch('https://exp.host/--/api/v2/push/send', options);
    Logger.log('Push notification sent: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error sending push notification: ' + error);
  }
}

/**
 * Get stored Expo push tokens from the "PushTokens" sheet.
 * Creates the sheet if it doesn't exist.
 */
function getStoredTokens() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('PushTokens');

  if (!sheet) {
    sheet = ss.insertSheet('PushTokens');
    return [];
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, 1).getValues();
  var tokens = [];

  for (var i = 0; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().trim() !== '') {
      tokens.push(values[i][0].toString().trim());
    }
  }

  return tokens;
}

/**
 * Handle GET requests - serves order data to the mobile app.
 * This is the web app endpoint that the mobile app calls to fetch orders.
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName('Orders');
    var rows = sheet.getRange('A4:I' + sheet.getLastRow()).getValues();

    var orders = [];
    var summaryMap = {};

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var fullClient = row[0] ? row[0].toString() : '';
      if (!fullClient || fullClient === 'total') continue;

      var parts = fullClient.split(' | ');
      var clientName = parts[1] || row[1] || '';
      var desc = row[4] ? row[4].toString() : '';
      var price = parseFloat(row[5]) || 0;
      var disc_price = parseFloat(row[6]) || 0;
      var quant = parseFloat(row[7]) || 0;
      var total = parseFloat(row[8]) || 0;

      orders.push({
        clientNum: parts[0] || '',
        clientName: clientName,
        Client: fullClient,
        desc: desc,
        price: price,
        disc_price: disc_price,
        quant: quant,
        total: total
      });

      if (!summaryMap[fullClient]) {
        summaryMap[fullClient] = 0;
      }
      summaryMap[fullClient] += total;
    }

    var summary = [];
    for (var client in summaryMap) {
      summary.push({ Client: client, total: summaryMap[client] });
    }
    summary.sort(function(a, b) { return a.Client.localeCompare(b.Client); });

    // Get last modified time
    var file = DriveApp.getFileById(ss.getId());
    var lastModified = file.getLastUpdated().toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' });

    var result = {
      orders: orders,
      summary: summary,
      lastModified: lastModified
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests to register push tokens.
 * This is called by the mobile app to store its Expo push token.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var token = data.token;

    if (!token) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'No token provided' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Store token in PushTokens sheet (avoid duplicates)
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName('PushTokens');

    if (!sheet) {
      sheet = ss.insertSheet('PushTokens');
    }

    // Check if token already exists
    var existingTokens = getStoredTokens();
    if (existingTokens.indexOf(token) === -1) {
      sheet.appendRow([token]);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
