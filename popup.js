let currentTab = null;
let tabs = [];
let frames = [];
let messages = [];
let currentFilter = 'all';
let autocompleteIndex = -1;

// Comprehensive list of CDP methods
const CDP_METHODS = [
  // Runtime domain
  'Runtime.evaluate', 'Runtime.callFunctionOn', 'Runtime.getProperties', 'Runtime.enable',
  'Runtime.disable', 'Runtime.releaseObject', 'Runtime.compileScript', 'Runtime.runScript',

  // Page domain
  'Page.enable', 'Page.disable', 'Page.navigate', 'Page.reload', 'Page.getFrameTree',
  'Page.captureScreenshot', 'Page.printToPDF', 'Page.setDocumentContent', 'Page.getResourceContent',

  // DOM domain
  'DOM.enable', 'DOM.disable', 'DOM.getDocument', 'DOM.querySelector', 'DOM.querySelectorAll',
  'DOM.getOuterHTML', 'DOM.setOuterHTML', 'DOM.removeNode', 'DOM.setAttributeValue',
  'DOM.removeAttribute', 'DOM.getAttributes', 'DOM.copyTo', 'DOM.moveTo',

  // Network domain
  'Network.enable', 'Network.disable', 'Network.setCacheDisabled', 'Network.setUserAgentOverride',
  'Network.setExtraHTTPHeaders', 'Network.getCookies', 'Network.deleteCookies', 'Network.clearBrowserCookies',
  'Network.emulateNetworkConditions', 'Network.setBlockedURLs',

  // Debugger domain
  'Debugger.enable', 'Debugger.disable', 'Debugger.setBreakpoint', 'Debugger.removeBreakpoint',
  'Debugger.pause', 'Debugger.resume', 'Debugger.stepOver', 'Debugger.stepInto', 'Debugger.stepOut',

  // Console domain
  'Console.enable', 'Console.disable', 'Console.clearMessages',

  // Input domain
  'Input.dispatchKeyEvent', 'Input.dispatchMouseEvent', 'Input.insertText', 'Input.emulateTouchFromMouseEvent',

  // Emulation domain
  'Emulation.setDeviceMetricsOverride', 'Emulation.clearDeviceMetricsOverride', 'Emulation.setGeolocationOverride',
  'Emulation.clearGeolocationOverride', 'Emulation.setUserAgentOverride', 'Emulation.setTouchEmulationEnabled',

  // Storage domain
  'Storage.clearDataForOrigin', 'Storage.getCookies', 'Storage.setCookies', 'Storage.clearCookies',

  // Performance domain
  'Performance.enable', 'Performance.disable', 'Performance.getMetrics',

  // Security domain
  'Security.enable', 'Security.disable', 'Security.setIgnoreCertificateErrors',

  // Target domain
  'Target.createTarget', 'Target.closeTarget', 'Target.attachToTarget', 'Target.detachFromTarget',

  // CSS domain
  'CSS.enable', 'CSS.disable', 'CSS.getMatchedStylesForNode', 'CSS.getInlineStylesForNode',
  'CSS.setStyleTexts', 'CSS.addRule',

  // Overlay domain
  'Overlay.enable', 'Overlay.disable', 'Overlay.highlightNode', 'Overlay.hideHighlight'
].sort();

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentTab();
  await refreshTabs();

  document.getElementById('terminateBtn').addEventListener('click', terminateAllSessions);
  document.getElementById('dockRightBtn').addEventListener('click', dockToRight);
  document.getElementById('openWindowBtn').addEventListener('click', openInWindow);
  document.getElementById('refreshTabs').addEventListener('click', refreshTabs);
  document.getElementById('tabSelect').addEventListener('change', onTabSelect);
  document.getElementById('refreshFrames').addEventListener('click', refreshFrames);
  document.getElementById('executeBtn').addEventListener('click', executeCDP);

  // Autocomplete for CDP method input
  const methodInput = document.getElementById('methodInput');
  methodInput.addEventListener('input', handleAutocomplete);
  methodInput.addEventListener('keydown', handleAutocompleteKeydown);
  methodInput.addEventListener('blur', () => setTimeout(hideAutocomplete, 200));

  // Monitor controls
  document.getElementById('filterAll').addEventListener('click', () => setFilter('all'));
  document.getElementById('filterOutgoing').addEventListener('click', () => setFilter('outgoing'));
  document.getElementById('filterIncoming').addEventListener('click', () => setFilter('incoming'));
  document.getElementById('exportLog').addEventListener('click', exportLog);
  document.getElementById('clearLog').addEventListener('click', clearLog);
  document.getElementById('searchBox').addEventListener('input', filterMessages);
  
  // Load existing messages from background
  loadExistingMessages();
  
  // Listen for new messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'cdpMessage') {
      addMessage(request.message);
    }
  });
});

// Get the current active tab
async function loadCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Don't set current tab if it's an extension page
  if (tab && tab.url && !tab.url.startsWith('chrome-extension://')) {
    currentTab = tab;
  }
}

// Terminate all CDP sessions
async function terminateAllSessions() {
  const terminateBtn = document.getElementById('terminateBtn');
  const progressContainer = document.getElementById('terminateProgress');
  const progressBar = document.getElementById('terminateProgressBar');

  terminateBtn.disabled = true;

  // Show and animate progress bar
  progressContainer.classList.add('show');
  progressBar.style.width = '0%';

  // Animate progress bar from 0 to 100% over 10 seconds
  const duration = 10000; // 10 seconds
  const interval = 100; // Update every 100ms
  const steps = duration / interval;
  const increment = 100 / steps;
  let currentProgress = 0;
  let apiCompleted = false;

  const progressInterval = setInterval(() => {
    currentProgress += increment;
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(progressInterval);

      // If API completed, hide progress bar after reaching 100%
      if (apiCompleted) {
        setTimeout(() => {
          progressContainer.classList.remove('show');
          progressBar.style.width = '0%';
        }, 500);
      }
    }
    progressBar.style.width = `${currentProgress}%`;
  }, interval);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'terminateAllSessions' });

    // Mark API as completed
    apiCompleted = true;

    // If progress bar already at 100%, hide it now
    if (currentProgress >= 100) {
      setTimeout(() => {
        progressContainer.classList.remove('show');
        progressBar.style.width = '0%';
      }, 500);
    }

    if (response && response.success) {
      showResult(`Terminated ${response.count} CDP session(s)`, 'success');
    } else {
      showResult('No active CDP sessions to terminate', 'success');
    }
  } catch (error) {
    console.error('Error terminating sessions:', error);

    // Hide progress bar on error
    clearInterval(progressInterval);
    progressContainer.classList.remove('show');
    progressBar.style.width = '0%';

    showResult(`Error terminating sessions: ${error.message}`, 'error');
  } finally {
    terminateBtn.disabled = false;
  }
}

// Dock popup to right side using Side Panel
async function dockToRight() {
  try {
    // Get the current window
    const currentWindow = await chrome.windows.getCurrent();

    // Open the side panel
    await chrome.sidePanel.open({ windowId: currentWindow.id });

    // Close the popup after opening side panel
    window.close();
  } catch (error) {
    console.error('Error opening side panel:', error);
    showResult(`Error opening side panel: ${error.message}`, 'error');
  }
}

// Open popup in a new window
function openInWindow() {
  const popupUrl = chrome.runtime.getURL('popup.html');
  chrome.windows.create({
    url: popupUrl,
    type: 'popup',
    width: 750,
    height: 800,
    focused: true
  }, () => {
    // Close the popup after opening new window
    window.close();
  });
}

// Refresh the list of tabs
async function refreshTabs() {
  const tabSelect = document.getElementById('tabSelect');
  const frameSelect = document.getElementById('frameSelect');
  const executeBtn = document.getElementById('executeBtn');

  tabSelect.innerHTML = '<option value="">Loading tabs...</option>';
  frameSelect.innerHTML = '<option value="">Select a tab first...</option>';
  executeBtn.disabled = true;

  try {
    // Get all tabs
    const allTabs = await chrome.tabs.query({});

    // Filter out Chrome internal pages and extension pages
    tabs = allTabs.filter(tab => {
      const url = tab.url || '';
      return !url.startsWith('chrome://') &&
             !url.startsWith('chrome-extension://') &&
             !url.includes('chrome.google.com/webstore');
    });

    if (!tabs || tabs.length === 0) {
      throw new Error('No accessible tabs found');
    }

    displayTabs();

    // Auto-select current tab, or first tab if no current tab
    if (currentTab && currentTab.id) {
      tabSelect.value = currentTab.id.toString();
      await refreshFrames();
    } else if (tabs.length > 0) {
      // If no current tab (e.g., opened in new window), select the first tab
      tabSelect.value = tabs[0].id.toString();
      currentTab = tabs[0];
      await refreshFrames();
    }
  } catch (error) {
    console.error('Error refreshing tabs:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    tabSelect.innerHTML = `<option value="">Error: ${errorMessage}</option>`;
    showResult(`Error loading tabs: ${errorMessage}`, 'error');
  }
}

// Display tabs in the select dropdown
function displayTabs() {
  const tabSelect = document.getElementById('tabSelect');
  tabSelect.innerHTML = '';

  if (tabs.length === 0) {
    tabSelect.innerHTML = '<option value="">No tabs found</option>';
    return;
  }

  tabs.forEach((tab) => {
    const option = document.createElement('option');
    option.value = tab.id.toString();

    let label = tab.title || tab.url || 'Untitled Tab';
    if (tab.id === currentTab?.id) {
      label = `[CURRENT] ${label}`;
    }

    // Truncate long titles
    if (label && label.length > 80) {
      label = label.substring(0, 77) + '...';
    }

    option.textContent = label;
    option.title = `${tab.title || 'Untitled'}\n${tab.url || 'No URL'}`; // Tooltip with full info
    tabSelect.appendChild(option);
  });
}

// Handle tab selection change
async function onTabSelect() {
  const tabSelect = document.getElementById('tabSelect');
  const selectedTabId = parseInt(tabSelect.value);

  if (!selectedTabId) {
    return;
  }

  // Update current tab
  currentTab = tabs.find(tab => tab.id === selectedTabId);

  // Clear frames and refresh for new tab
  frames = [];
  const frameSelect = document.getElementById('frameSelect');
  frameSelect.innerHTML = '<option value="">Loading frames...</option>';

  await refreshFrames();

  // Load messages for the selected tab
  await loadExistingMessages();
}

// Refresh the list of frames
async function refreshFrames() {
  const frameSelect = document.getElementById('frameSelect');
  const executeBtn = document.getElementById('executeBtn');

  if (!currentTab || !currentTab.id) {
    frameSelect.innerHTML = '<option value="">Select a tab first...</option>';
    executeBtn.disabled = true;
    return;
  }

  frameSelect.innerHTML = '<option value="">Loading frames...</option>';
  executeBtn.disabled = true;

  try {
    // Inject content script to discover frames
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      files: ['content.js']
    });

    // Get frames from content script
    const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'getFrames' });

    if (response && response.frames) {
      frames = response.frames;
      displayFrames();
      executeBtn.disabled = false;
    } else {
      throw new Error('No frames found');
    }
  } catch (error) {
    console.error('Error refreshing frames:', error);
    frameSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
    showResult(`Error loading frames: ${error.message}`, 'error');
  }
}

// Display frames in the select dropdown
function displayFrames() {
  const frameSelect = document.getElementById('frameSelect');
  frameSelect.innerHTML = '';

  if (frames.length === 0) {
    frameSelect.innerHTML = '<option value="">No frames found</option>';
    return;
  }

  let topFrameId = null;

  frames.forEach((frame, index) => {
    const option = document.createElement('option');
    option.value = frame.frameId;

    let label = `[${index}] ${frame.url}`;
    if (frame.name) {
      label = `[${index}] ${frame.name} - ${frame.url}`;
    }
    if (frame.isMainFrame) {
      label = `[TOP] ${frame.url}`;
      topFrameId = frame.frameId;
    }

    option.textContent = label;
    option.title = frame.url; // Tooltip with full URL
    frameSelect.appendChild(option);
  });

  // Auto-select the TOP frame
  if (topFrameId) {
    frameSelect.value = topFrameId;
  }
}

// Execute CDP command
async function executeCDP() {
  const frameSelect = document.getElementById('frameSelect');
  const methodInput = document.getElementById('methodInput');
  const paramsInput = document.getElementById('paramsInput');
  const executeBtn = document.getElementById('executeBtn');
  
  const selectedFrameId = frameSelect.value;
  const method = methodInput.value.trim();
  const paramsText = paramsInput.value.trim();
  
  // Validation
  if (!selectedFrameId) {
    showResult('Please select a frame', 'error');
    return;
  }
  
  if (!method) {
    showResult('Please enter a CDP method', 'error');
    return;
  }
  
  let params = {};
  if (paramsText) {
    try {
      params = JSON.parse(paramsText);
    } catch (error) {
      showResult(`Invalid JSON in parameters: ${error.message}`, 'error');
      return;
    }
  }
  
  executeBtn.disabled = true;
  showResult('Executing...', 'loading');
  
  try {
    // Send message to background script to execute CDP
    const response = await chrome.runtime.sendMessage({
      action: 'executeCDP',
      tabId: currentTab.id,
      frameId: selectedFrameId,
      method: method,
      params: params
    });
    
    if (response.success) {
      showResult(JSON.stringify(response.result, null, 2), 'success');
    } else {
      showResult(`Error: ${response.error}`, 'error');
    }
  } catch (error) {
    showResult(`Error: ${error.message}`, 'error');
  } finally {
    executeBtn.disabled = false;
  }
}

// Display result
function showResult(message, type) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = message;
  resultDiv.className = type;
  resultDiv.style.display = 'block';
}

// Load existing messages from background
async function loadExistingMessages() {
  try {
    if (!currentTab || !currentTab.id) {
      messages = [];
      renderMessages();
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'getMessages',
      tabId: currentTab.id
    });

    if (response && response.messages) {
      messages = response.messages;
      renderMessages();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Add a new message to the log
function addMessage(message) {
  // Only add message if it's for the currently selected tab
  if (!currentTab || !currentTab.id || message.tabId !== currentTab.id) {
    return;
  }

  messages.push(message);

  // Keep only last 100000 messages
  if (messages.length > 100000) {
    messages.shift();
  }

  renderMessages();
}

// Set filter
function setFilter(filter) {
  currentFilter = filter;
  
  // Update button styles
  document.getElementById('filterAll').classList.remove('active');
  document.getElementById('filterOutgoing').classList.remove('active');
  document.getElementById('filterIncoming').classList.remove('active');
  
  if (filter === 'all') {
    document.getElementById('filterAll').classList.add('active');
  } else if (filter === 'outgoing') {
    document.getElementById('filterOutgoing').classList.add('active');
  } else if (filter === 'incoming') {
    document.getElementById('filterIncoming').classList.add('active');
  }
  
  filterMessages();
}

// Filter and render messages
function filterMessages() {
  const searchTerm = document.getElementById('searchBox').value.toLowerCase();
  renderMessages(searchTerm);
}

// Render messages
function renderMessages(searchTerm = '') {
  const messageLog = document.getElementById('messageLog');
  
  // Filter messages
  let filteredMessages = messages;
  
  // Apply direction filter
  if (currentFilter !== 'all') {
    filteredMessages = filteredMessages.filter(msg => msg.direction === currentFilter);
  }
  
  // Apply search filter
  if (searchTerm) {
    filteredMessages = filteredMessages.filter(msg => {
      const methodMatch = msg.method ? msg.method.toLowerCase().includes(searchTerm) : false;
      const paramsMatch = msg.params ? JSON.stringify(msg.params).toLowerCase().includes(searchTerm) : false;
      const resultMatch = msg.result ? JSON.stringify(msg.result).toLowerCase().includes(searchTerm) : false;
      return methodMatch || paramsMatch || resultMatch;
    });
  }
  
  // Render
  if (filteredMessages.length === 0) {
    messageLog.innerHTML = '<div class="empty-log">No messages match your filters.</div>';
    return;
  }
  
  messageLog.innerHTML = '';
  
  filteredMessages.forEach((msg, index) => {
    const row = createMessageRow(msg, index);
    messageLog.appendChild(row);
  });
  
  // Auto-scroll to bottom
  messageLog.scrollTop = messageLog.scrollHeight;
}

// Create a message row element
function createMessageRow(msg, index) {
  const row = document.createElement('div');
  row.className = `message-row ${msg.direction} ${msg.error ? 'error' : ''}`;
  
  const header = document.createElement('div');
  header.className = 'message-header';
  
  const direction = document.createElement('span');
  direction.className = `message-direction ${msg.direction}`;
  direction.textContent = msg.direction === 'outgoing' ? '→ OUT' : '← IN';
  
  const timestamp = document.createElement('span');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = formatTimestamp(msg.timestamp);
  
  header.appendChild(direction);
  header.appendChild(timestamp);
  
  const method = document.createElement('div');
  method.className = 'message-method';
  method.textContent = msg.method;
  
  const params = document.createElement('div');
  params.className = 'message-params';
  
  if (msg.direction === 'outgoing') {
    params.textContent = `Params: ${JSON.stringify(msg.params)}`;
  } else {
    if (msg.error) {
      params.textContent = `Error: ${msg.error}`;
    } else {
      params.textContent = `Result: ${JSON.stringify(msg.result).substring(0, 100)}...`;
    }
  }
  
  const detail = document.createElement('div');
  detail.className = 'message-detail';

  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-json-btn';
  copyBtn.textContent = 'Copy as JSON';
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent row collapse when clicking button
    copyMessageAsJson(msg, copyBtn);
  });

  const detailText = document.createElement('div');

  if (msg.direction === 'outgoing') {
    detailText.textContent = `Method: ${msg.method}\n\nParameters:\n${JSON.stringify(msg.params, null, 2)}`;
  } else {
    if (msg.error) {
      detailText.textContent = `Method: ${msg.method}\n\nError:\n${msg.error}`;
    } else {
      detailText.textContent = `Method: ${msg.method}\n\nResult:\n${JSON.stringify(msg.result, null, 2)}`;
    }
  }

  detail.appendChild(copyBtn);
  detail.appendChild(detailText);

  row.appendChild(header);
  row.appendChild(method);
  row.appendChild(params);
  row.appendChild(detail);

  // Toggle detail on click
  row.addEventListener('click', () => {
    row.classList.toggle('expanded');
  });

  return row;
}

// Copy message as JSON in the specified format
function copyMessageAsJson(msg, buttonElement) {
  // For outgoing messages use params, for incoming use result
  const data = msg.direction === 'outgoing' ? (msg.params || {}) : (msg.result || {});

  const jsonObj = {
    [msg.method]: data
  };

  const jsonString = JSON.stringify(jsonObj, null, 2);

  // Copy to clipboard
  navigator.clipboard.writeText(jsonString).then(() => {
    // Show success feedback
    showResult('Copied to clipboard!', 'success');

    // Change button text temporarily
    if (buttonElement) {
      const originalText = buttonElement.textContent;
      buttonElement.textContent = 'Copied!';
      buttonElement.style.backgroundColor = '#16a34a';

      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.backgroundColor = '';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy:', err);
    showResult('Failed to copy to clipboard', 'error');
  });
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

// Export log as JSON
function exportLog() {
  if (messages.length === 0) {
    showResult('No messages to export', 'error');
    return;
  }

  // Create JSON string with pretty formatting
  const jsonString = JSON.stringify(messages, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Generate filename with timestamp and tab info
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const tabInfo = currentTab ? `tab-${currentTab.id}` : 'messages';
  a.download = `cdp-${tabInfo}-${timestamp}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showResult(`Exported ${messages.length} messages to JSON`, 'success');
}

// Clear log
function clearLog() {
  messages = [];

  // Clear messages for the currently selected tab
  if (currentTab && currentTab.id) {
    chrome.runtime.sendMessage({
      action: 'clearMessages',
      tabId: currentTab.id
    });
  }

  renderMessages();
}

// Handle autocomplete input
function handleAutocomplete(e) {
  const input = e.target.value;
  const autocompleteList = document.getElementById('autocompleteList');

  if (!input) {
    hideAutocomplete();
    return;
  }

  // Filter methods that match the input
  const matches = CDP_METHODS.filter(method =>
    method.toLowerCase().includes(input.toLowerCase())
  );

  if (matches.length === 0) {
    hideAutocomplete();
    return;
  }

  // Show autocomplete list
  autocompleteList.innerHTML = '';
  autocompleteIndex = -1;

  matches.slice(0, 20).forEach(method => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';

    const [domain, name] = method.split('.');
    item.innerHTML = `<span class="method-domain">${domain}</span>.<span class="method-name">${name}</span>`;

    item.addEventListener('click', () => {
      document.getElementById('methodInput').value = method;
      hideAutocomplete();
      document.getElementById('methodInput').focus();
    });

    autocompleteList.appendChild(item);
  });

  autocompleteList.classList.add('show');
}

// Handle keyboard navigation in autocomplete
function handleAutocompleteKeydown(e) {
  const autocompleteList = document.getElementById('autocompleteList');
  const items = autocompleteList.querySelectorAll('.autocomplete-item');

  if (!autocompleteList.classList.contains('show') || items.length === 0) {
    return;
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
      updateActiveItem(items);
      break;

    case 'ArrowUp':
      e.preventDefault();
      autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
      updateActiveItem(items);
      break;

    case 'Enter':
      e.preventDefault();
      if (autocompleteIndex >= 0 && autocompleteIndex < items.length) {
        items[autocompleteIndex].click();
      }
      break;

    case 'Escape':
      hideAutocomplete();
      break;
  }
}

// Update active autocomplete item
function updateActiveItem(items) {
  items.forEach((item, index) => {
    if (index === autocompleteIndex) {
      item.classList.add('active');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });
}

// Hide autocomplete list
function hideAutocomplete() {
  const autocompleteList = document.getElementById('autocompleteList');
  autocompleteList.classList.remove('show');
  autocompleteIndex = -1;
}
