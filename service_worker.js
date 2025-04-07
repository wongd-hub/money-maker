import { authenticateAndGetToken } from './scripts/auth.js';
import { buildMimeMessage, sendGmailMessage } from './scripts/gmail.js';
import { captureScreenshot } from './scripts/screenshot.js';

async function getStoredEmailOptions() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      {
        'emailSubject': null, 
        'emailRecipient': null, 
        'emailBody': 'Hi team, please find a screenshot of my latest timesheet attached to this email.'
      },
      (data) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(data);
      }
    );
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'capture_and_email') {

    console.log('Beginning capture and email process');

    // Perform async logic - capture screenshot of active tab
    (async () => {

      try {

        // 0) Load saved settings
        const { emailSubject, emailRecipient, emailBody } = await getStoredEmailOptions();

        // If subject or recipient is null, we stop and return an error
        if (!emailSubject || !emailRecipient) {
          console.warn('Settings missing (subject, recipient):', { emailSubject, emailRecipient });

          // Send an error back, so the content script or popup can alert()
          sendResponse({
            error: 'Please configure your extension settings (subject & recipient) first.'
          });
          return;
        }

        // 1) Capture screenshot from background
        const screenshot = await captureScreenshot();
        
        // 2) Get OAuth token
        const token = await authenticateAndGetToken(true);

        // 3) Build your MIME (with the base64 screenshot)
        const base64Image = screenshot.replace(/^data:image\/jpeg;base64,/, ''); // if JPEG
        const rawMime = buildMimeMessage(emailRecipient, emailSubject, emailBody, base64Image);
    
        // 4) Send the email
        const result = await sendGmailMessage(token, rawMime);
        console.log(' └─ Email sent!');

        sendResponse({ success: true, result });

      } catch (err) {
        console.error(` └─ Error in service worker: ${err.message}`);
        sendResponse({ error: err.message });
      }

    })();

    // Return true outside of async logic to indicate we’ll send the response asynchronously
    return true;
  }

});
