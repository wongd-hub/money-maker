import { authenticateAndGetToken } from './scripts/auth.js';
import { buildMimeMessage, sendGmailMessage } from './scripts/gmail.js';
import { captureScreenshot } from './scripts/screenshot.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'capture_and_email') {

    console.log('Beginning capture and email process');

    // Perform async logic - capture screenshot of active tab
    (async () => {

      try {

        // 1) Capture screenshot from background
        const screenshot = await captureScreenshot();
        
        // 2) Get OAuth token
        const token = await authenticateAndGetToken(true);

        // 3) Build your MIME (with the base64 screenshot)
        const target_email = 'darrenwongy@gmail.com';
        const base64Image = screenshot.replace(/^data:image\/jpeg;base64,/, ''); // if JPEG
        const rawMime = buildMimeMessage(target_email, 'DW | Timesheet', 'Hi team, please find my timesheet attached to this email.', base64Image);
    
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
