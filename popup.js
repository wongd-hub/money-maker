document.addEventListener('DOMContentLoaded', () => {
  const captureBtn = document.getElementById('captureBtn');

  captureBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'capture_screenshot' }, (response) => {
      if (!response) {
        console.error('No response object');
        return;
      }

      if (response.error) {
        alert('Screenshot error: ' + response.error);
        return;
      }

      const screenshotDataUrl = response.screenshot;
      if (!screenshotDataUrl) {
        alert('No screenshot data received');
        return;
      }

      // At this point, we have a base64-encoded PNG in "screenshotDataUrl".
      // We can create a mailto link or use an API to send it along.

      // Example (simplistic) mailto approach:
      const subject = encodeURIComponent('My Timesheet Screenshot');
      const body = encodeURIComponent('Screenshot: ' + screenshotDataUrl);
      const mailtoLink = `mailto:someone@example.com?subject=${subject}&body=${body}`;

      // Open a new mail client window/tab:
      window.open(mailtoLink);

      // For a more robust approach, you might upload the screenshot to a server or use an email-sending service.
    });
  });
});
