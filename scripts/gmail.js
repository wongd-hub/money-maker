function buildMimeMessage(to, subject, messageText, base64Image) {

  console.log(' └─ Building Mime message contents');

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
  console.log(' └─ Sending Gmail');
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

export { buildMimeMessage, sendGmailMessage };