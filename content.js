// Content script to discover frames
(function() {
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getFrames') {
      const frames = discoverFrames();
      sendResponse({ frames: frames });
    }
    return true; // Keep message channel open for async response
  });
  
  // Discover all frames in the page
  function discoverFrames() {
    const frameList = [];
    
    // Add main frame
    frameList.push({
      frameId: 'main',
      url: window.location.href,
      name: '',
      isMainFrame: true
    });
    
    // Discover iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      try {
        // Try to get frame info
        let frameUrl = iframe.src || iframe.getAttribute('src') || 'about:blank';
        let frameName = iframe.name || iframe.id || `iframe-${index}`;
        
        frameList.push({
          frameId: `frame-${index}`,
          url: frameUrl,
          name: frameName,
          isMainFrame: false,
          element: `iframe[${index}]`
        });
      } catch (error) {
        // Cross-origin iframes might throw errors
        console.warn('Could not access iframe:', error);
        frameList.push({
          frameId: `frame-${index}`,
          url: 'cross-origin or restricted',
          name: iframe.name || iframe.id || `iframe-${index}`,
          isMainFrame: false,
          element: `iframe[${index}]`
        });
      }
    });
    
    return frameList;
  }
})();
