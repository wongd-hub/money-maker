// Example helper for capturing screenshot by sending a message to background
async function captureScreenshot() {
  console.log(" └─ Beginning screenshot capture");
  try {
    // Query the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab');
    // Capture as JPEG (or PNG)
    const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg' });
    return screenshot;
  } catch (err) {
    throw err;
  }
}

export { captureScreenshot };