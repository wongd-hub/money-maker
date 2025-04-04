chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'capture_screenshot') {

    // Perform async logic - capture screenshot of active tab
    (async () => {
      try {

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          throw new Error('No active tab');
        }

        // Grab image as base64 string and send back to popup
        const imageUri = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg' });
        sendResponse({ screenshot: imageUri });

      } catch (error) {

        // If error, log out to console
        console.error(error);
        sendResponse({ error: error.message });

      }

    })();

    // Return true outside of async logic to indicate we’ll send the response asynchronously
    return true;
  }

});