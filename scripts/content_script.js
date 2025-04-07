// Create a banner
const banner = document.createElement('div');
banner.textContent = "Click here to screenshot & email! Configure your options in the extension popup itself.";

// Set banner styling
banner.style.position = 'absolute';
banner.style.top = '0';
banner.style.left = '0';
banner.style.width = '100%';
banner.style.backgroundColor = '#ffeb3b';
banner.style.padding = '10px';
banner.style.fontWeight = 'bold';
banner.style.cursor = 'pointer';
banner.style.zIndex = '99999';
banner.style.textAlign = 'center';
banner.style.fontSize = '0.8rem';
banner.style.background = 'linear-gradient(to right, rgb(249, 168, 212), rgb(216, 180, 254), rgb(129, 140, 248))';
banner.style.color = '#ffffff';

// Insert banner as the first element in the body and push all other page contents down
document.body.insertBefore(banner, document.body.firstChild);

requestAnimationFrame(() => {
  const bannerHeight = banner.offsetHeight; // measure the rendered height
  document.body.style.marginTop = bannerHeight + 'px';
});

// Insert onClick listener to trigger screenshot + email workflow
banner.addEventListener('click', () => {

  console.log('Banner clicked, sending message for screenshot/email...');
  
  // Send a message requesting the screenshot/email workflow to the 
  // service worker and await response
  chrome.runtime.sendMessage({ action: 'capture_and_email' }, (response) => {

    if (response && response.error) {
      console.error('Error from background:', response.error);
      alert('Error: ' + response.error);
    } else if (response && response.success) {
      console.log('Screenshot/email completed successfully!');
      alert('Screenshot emailed successfully!');
    }
    
  });

});