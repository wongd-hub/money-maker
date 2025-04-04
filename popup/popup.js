import { authenticateAndGetToken } from '../scripts/auth.js';
import { buildMimeMessage, sendGmailMessage } from '../scripts/gmail.js';
import { captureScreenshot } from '../scripts/screenshot.js';

document.getElementById('captureBtn').addEventListener('click', async () => {
  try {
    // 1) Capture screenshot from background
    const screenshot = await captureScreenshot(); // or do runtime.sendMessage to background
    // 2) Get OAuth token
    const token = await authenticateAndGetToken(true);
    // 3) Build your MIME (with the base64 screenshot)
    const base64Image = screenshot.replace(/^data:image\/jpeg;base64,/, ''); // if JPEG
    const rawMime = buildMimeMessage('darrenwongy@gmail.com', 'Test email', 'Body text', base64Image);

    // 4) Send the email
    const result = await sendGmailMessage(token, rawMime);
    console.log('Email sent, result:', result);
    alert('Email sent successfully!');
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  }
});