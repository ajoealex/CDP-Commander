// Background service worker for CDP execution
let activeSessions = new Map(); // Map of tabId -> { debuggerAttached: boolean }
let messagesByTab = new Map(); // Map of tabId -> array of messages
let currentMonitoringTabId = null; // Tab currently being monitored

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeCDP') {
    executeCDPCommand(request)
      .then(result => sendResponse({ success: true, result: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getMessages') {
    const tabId = request.tabId;
    const messages = tabId ? (messagesByTab.get(tabId) || []) : [];
    sendResponse({ messages: messages });
    return true;
  }

  if (request.action === 'clearMessages') {
    const tabId = request.tabId;
    if (tabId) {
      messagesByTab.set(tabId, []);
    } else {
      messagesByTab.clear();
    }
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'terminateAllSessions') {
    terminateAllSessions()
      .then(count => sendResponse({ success: true, count: count }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Execute CDP command
async function executeCDPCommand({ tabId, frameId, method, params }) {
  try {
    // Attach debugger if not already attached for this tab
    const session = activeSessions.get(tabId);
    if (!session || !session.debuggerAttached) {
      await attachDebugger(tabId);
    }

    // Switch to the tab if monitoring a different one
    if (currentMonitoringTabId !== tabId) {
      currentMonitoringTabId = tabId;
      await chrome.tabs.update(tabId, { active: true });
    }
    
    // Get the actual frame ID for CDP
    const cdpFrameId = await getCDPFrameId(tabId, frameId);
    
    // Add frameId to params if it's not the main frame
    if (cdpFrameId && cdpFrameId !== 'main') {
      params = { ...params, frameId: cdpFrameId };
    }
    
    // Log outgoing message
    const outgoingMessage = {
      direction: 'outgoing',
      method: method,
      params: params,
      timestamp: Date.now(),
      tabId: tabId
    };
    logMessage(outgoingMessage, tabId);
    
    // Execute CDP command
    const result = await chrome.debugger.sendCommand(
      { tabId: tabId },
      method,
      params
    );
    
    // Log incoming message (response)
    const incomingMessage = {
      direction: 'incoming',
      method: method,
      result: result,
      timestamp: Date.now(),
      tabId: tabId
    };
    logMessage(incomingMessage, tabId);
    
    return result;
  } catch (error) {
    console.error('CDP execution error:', error);
    
    // Log error message
    const errorMessage = {
      direction: 'incoming',
      method: method,
      error: error.message,
      timestamp: Date.now(),
      tabId: tabId
    };
    logMessage(errorMessage, tabId);
    
    throw error;
  }
}

// Attach debugger to tab
async function attachDebugger(tabId) {
  try {
    await chrome.debugger.attach({ tabId: tabId }, '1.3');

    // Enable necessary domains
    await chrome.debugger.sendCommand({ tabId: tabId }, 'Page.enable');
    await chrome.debugger.sendCommand({ tabId: tabId }, 'Runtime.enable');

    // Mark session as active
    activeSessions.set(tabId, { debuggerAttached: true });

    console.log('Debugger attached to tab:', tabId);
  } catch (error) {
    if (error.message.includes('Another debugger is already attached')) {
      activeSessions.set(tabId, { debuggerAttached: true });
      console.log('Debugger already attached');
    } else {
      throw error;
    }
  }
}

// Get CDP frame ID from our custom frame ID
async function getCDPFrameId(tabId, frameId) {
  if (frameId === 'main') {
    // Get main frame ID from CDP
    const frameTree = await chrome.debugger.sendCommand(
      { tabId: tabId },
      'Page.getFrameTree'
    );
    return frameTree.frameTree.frame.id;
  }
  
  // For iframes, we need to get the frame tree and match
  const frameTree = await chrome.debugger.sendCommand(
    { tabId: tabId },
    'Page.getFrameTree'
  );
  
  // Extract frame index from our frameId (format: "frame-0", "frame-1", etc.)
  const frameIndex = parseInt(frameId.split('-')[1]);
  
  // Navigate frame tree to find the iframe
  const cdpFrameId = findFrameInTree(frameTree.frameTree, frameIndex);
  
  return cdpFrameId;
}

// Helper to find frame in CDP frame tree
function findFrameInTree(node, targetIndex, currentIndex = { value: -1 }) {
  // Check child frames
  if (node.childFrames) {
    for (const childFrame of node.childFrames) {
      currentIndex.value++;
      if (currentIndex.value === targetIndex) {
        return childFrame.frame.id;
      }
      
      // Recursively search nested frames
      const found = findFrameInTree(childFrame, targetIndex, currentIndex);
      if (found) return found;
    }
  }
  
  return null;
}

// Terminate all CDP sessions
async function terminateAllSessions() {
  let count = 0;
  for (const [tabId, session] of activeSessions.entries()) {
    try {
      if (session.debuggerAttached) {
        await chrome.debugger.detach({ tabId: tabId });
        count++;
      }
    } catch (error) {
      console.error(`Error detaching from tab ${tabId}:`, error);
    }
  }
  activeSessions.clear();
  currentMonitoringTabId = null;
  messagesByTab.clear();
  console.log(`Terminated ${count} CDP session(s)`);
  return count;
}

// Handle debugger detachment
chrome.debugger.onDetach.addListener((source, reason) => {
  console.log('Debugger detached from tab:', source.tabId, 'reason:', reason);

  // Remove from active sessions
  activeSessions.delete(source.tabId);

  // Clear current monitoring if this was the monitored tab
  if (currentMonitoringTabId === source.tabId) {
    currentMonitoringTabId = null;
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove from active sessions
  activeSessions.delete(tabId);

  // Clear current monitoring if this was the monitored tab
  if (currentMonitoringTabId === tabId) {
    currentMonitoringTabId = null;
  }
});

// Log and broadcast CDP message
function logMessage(message, tabId) {
  // Get or create message array for this tab
  if (!messagesByTab.has(tabId)) {
    messagesByTab.set(tabId, []);
  }

  const messages = messagesByTab.get(tabId);
  messages.push(message);

  // Keep only last 100000 messages per tab
  if (messages.length > 100000) {
    messages.shift();
  }

  // Broadcast to all popup instances
  chrome.runtime.sendMessage({
    action: 'cdpMessage',
    message: message
  }).catch(() => {
    // Popup might not be open, ignore error
  });
}

// Listen for CDP events from debugger
chrome.debugger.onEvent.addListener((source, method, params) => {
  const tabId = source.tabId;

  // Log incoming CDP events (unsolicited messages from browser)
  const eventMessage = {
    direction: 'incoming',
    method: method,
    result: params,
    timestamp: Date.now(),
    isEvent: true,
    tabId: tabId
  };
  logMessage(eventMessage, tabId);
});
