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

export { authenticateAndGetToken };