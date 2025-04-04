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

export { captureScreenshot };