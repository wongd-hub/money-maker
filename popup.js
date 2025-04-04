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


// Example helper for capturing screenshot by sending a message to background
function captureScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'capture_screenshot' }, (response) => {
      if (!response || response.error) {
        return reject(new Error(response?.error || 'No response'));
      }
      resolve(response.screenshot);
    });
  });
}


// Provide your Google Client ID. (Created in Google Cloud Console > Credentials)
const CLIENT_ID = '157841387091-8hchgb8jlsqbb1t4tii7fgqtu0dbntl7.apps.googleusercontent.com';


// The scope needed for sending emails
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';


async function authenticateAndGetToken(interactive = true) {
  return new Promise((resolve, reject) => {
    // 1) Chrome auto-generates a redirect URI for your extension.
    // Typically: https://<EXTENSION_ID>.chromiumapp.org/...
    const redirectUri = chrome.identity.getRedirectURL();

    console.log('Redirect URL:', redirectUri);

    // 2) Build your OAuth URL.
    // For an Implicit flow: response_type=token
    // For a code flow: response_type=code (but then you have to exchange the code).
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', GMAIL_SEND_SCOPE);
    authUrl.searchParams.set('prompt', 'consent');  // or 'select_account'
    authUrl.searchParams.set('include_granted_scopes', 'true');

    // 3) Launch the web auth flow
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          // User might have closed the popup or an error occurred
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (!redirectUrl || redirectUrl.includes('error=')) {
          return reject(new Error('OAuth failed or was canceled'));
        }

        // 4) Extract the access token from the redirect URL fragment (#access_token=...)
        const m = redirectUrl.match(/[#&]access_token=([^&]+)/);
        if (!m) {
          return reject(new Error('No access token found'));
        }

        const accessToken = m[1];
        resolve(accessToken);
      }
    );
  });
}


function buildMimeMessage(to, subject, messageText, base64Image) {
  const boundary = 'boundary123';
  const mime =
`To: ${to}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset="UTF-8"

${messageText}

--${boundary}
Content-Type: image/jpeg; name="screenshot.jpg"
Content-Transfer-Encoding: base64

${base64Image}

--${boundary}--`;

  // Gmail API needs base64url, so we do +->-, /->_, strip trailing =
  return btoa(mime)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  
}

async function sendGmailMessage(accessToken, rawMime) {
  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawMime })
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gmail API error: ${res.status} - ${errBody}`);
  }
  return res.json();
}