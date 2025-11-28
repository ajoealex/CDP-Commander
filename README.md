# CDP Commander

A powerful Chrome extension that enables direct execution of Chrome DevTools Protocol (CDP) commands on any frame within a web page. Perfect for developers, QA engineers, and automation enthusiasts who need fine-grained control over browser behavior.
<img width="1280" height="799" alt="2" src="https://github.com/user-attachments/assets/d3ca5fc7-c716-4aac-a10a-a8201200f49b" />


![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## 🚀 Features

### Core Functionality
- **Direct CDP Access**: Execute any Chrome DevTools Protocol command directly from the browser
- **Frame-Level Control**: Target specific frames or iframes within a page for precise command execution
- **Multi-Tab Support**: Manage and execute commands across multiple browser tabs simultaneously
- **Real-Time Monitoring**: Live CDP message monitor showing all outgoing requests and incoming responses
- **Session Management**: Efficient CDP session handling with automatic cleanup and manual termination options

### User Interface
- **Three Display Modes**:
  - **Popup Mode**: Quick access via extension icon
  - **Side Panel Mode**: Dock to the right side of the browser for persistent access
  - **Window Mode**: Open in a dedicated window for maximum workspace flexibility
- **Intelligent Auto-Selection**: Automatically selects the current tab and first frame on launch
- **Autocomplete Support**: Built-in autocomplete for 60+ CDP methods across 15 domains
- **Message Filtering**: Filter CDP messages by direction (All/Outgoing/Incoming)
- **Search Functionality**: Search through message logs by method name or parameters
- **Export to JSON**: Download all CDP messages as a formatted JSON file for analysis
- **Copy to Clipboard**: Quickly copy individual CDP messages as formatted JSON

### Developer-Friendly
- **Comprehensive CDP Coverage**: Supports commands from all major CDP domains:
  - Runtime, Page, DOM, Network, Debugger
  - Console, Input, Emulation, Storage
  - Performance, Security, Target, CSS, Overlay
- **Error Handling**: Clear error messages and visual feedback for failed commands
- **Message History**: Stores up to 100,000 messages per tab for detailed analysis
- **Cross-Origin Support**: Handles cross-origin iframes gracefully

## 📋 Table of Contents

- [🔧 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Guide](#-usage-guide)
  - [Selecting Tabs and Frames](#selecting-tabs-and-frames)
  - [Executing CDP Commands](#executing-cdp-commands)
  - [Monitoring CDP Messages](#monitoring-cdp-messages)
  - [Managing Sessions](#managing-sessions)
  - [Display Modes](#display-modes)
- [📚 CDP Commands Reference](#-cdp-commands-reference)
- [💡 Use Cases & Examples](#-use-cases--examples)
- [🏗️ Architecture](#️-architecture)
- [🔍 Troubleshooting](#-troubleshooting)
- [❓ FAQ](#-faq)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🔧 Installation

### From Chrome Web Store
*Coming soon*

### Manual Installation (Developer Mode)

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/yourusername/cdp-commander.git
   ```

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `CDP Commander` directory
   - The extension icon should appear in your toolbar

5. **Pin the Extension** (Optional):
   - Click the puzzle piece icon in the toolbar
   - Click the pin icon next to "CDP Commander"

## 🚀 Quick Start

### Basic Example: Get Page Title

1. **Open CDP Commander** by clicking the extension icon
2. **Select a tab** from the dropdown (your current tab is auto-selected)
3. **Select the TOP frame** (main frame is auto-selected)
4. **Enter CDP Method**: `Runtime.evaluate`
5. **Enter Parameters**:
   ```json
   {"expression": "document.title"}
   ```
6. **Click "Execute CDP Command"**
7. **View the result** in the result panel below

### Example: Take a Screenshot

1. **CDP Method**: `Page.captureScreenshot`
2. **Parameters**:
   ```json
   {"format": "png"}
   ```
3. The result will contain a base64-encoded PNG image

### Example: Navigate to URL

1. **CDP Method**: `Page.navigate`
2. **Parameters**:
   ```json
   {"url": "https://www.example.com"}
   ```

## 📖 Usage Guide

### Selecting Tabs and Frames

#### Tab Selection
- **Automatic Selection**: When opened as a popup, your current tab is automatically selected
- **Manual Selection**: Use the "Select Tab" dropdown to choose any open tab
- **Refresh Tabs**: Click "Refresh Tabs" to update the list of available tabs
- **Current Tab Indicator**: Current tab is marked with `[CURRENT]` prefix

#### Frame Selection
- **Main Frame**: Labeled as `[TOP]` - represents the main document
- **Iframes**: Listed with index numbers `[0]`, `[1]`, etc.
- **Frame Information**: Hover over a frame to see its full URL
- **Refresh Frames**: Click "Refresh Frames" to reload the frame list
- **Cross-Origin Frames**: Labeled as "cross-origin or restricted"

### Executing CDP Commands

#### Method Input
- **Autocomplete**: Start typing to see matching CDP methods
- **Keyboard Navigation**:
  - `↓` / `↑` to navigate suggestions
  - `Enter` to select
  - `Esc` to close autocomplete
- **Format**: Use dot notation (e.g., `Domain.method`)

#### Parameters Input
- **JSON Format**: Parameters must be valid JSON
- **Optional**: Leave blank for commands without parameters
- **Examples**:
  ```json
  {}
  ```
  ```json
  {"expression": "console.log('Hello')"}
  ```
  ```json
  {
    "expression": "document.querySelector('h1').textContent",
    "returnByValue": true
  }
  ```

#### Execution
- Click **"Execute CDP Command"** button
- The button is disabled while executing
- Results appear in the result panel below
- **Success**: Green background with formatted JSON result
- **Error**: Red background with error message

### Monitoring CDP Messages

The CDP Message Monitor provides real-time visibility into all CDP communication:

#### Message Types
- **Outgoing** (Yellow): Commands sent from the extension
- **Incoming** (Blue): Responses and events from the browser
- **Error** (Red): Failed commands or protocol errors

#### Filtering
- **All**: Show all messages (default)
- **Outgoing**: Show only commands sent
- **Incoming**: Show only responses and events

#### Searching
- Type in the search box to filter messages
- Searches through method names, parameters, and results
- Case-insensitive matching

#### Message Details
- **Click a message** to expand and see full details
- **Copy as JSON**: Click the "Copy as JSON" button to copy formatted data
- **Timestamp**: Precise timing down to milliseconds
- **Scroll**: Auto-scrolls to latest messages

#### Exporting Messages
- Click **"Export as JSON"** to download all messages as a JSON file
- Export format: Pretty-printed JSON array with 2-space indentation
- Filename format: `cdp-tab-{tabId}-{timestamp}.json`
  - Example: `cdp-tab-123-2025-11-28T14-30-45.json`
- Exports all message data including:
  - Direction (outgoing/incoming)
  - Method name
  - Parameters/results
  - Timestamps
  - Error messages (if any)
  - Tab ID
- Shows success message with count of exported messages
- Useful for:
  - Debugging and analysis
  - Sharing with team members
  - Creating documentation
  - Bug reports

#### Clearing Messages
- Click **"Clear Log"** to remove all messages for the current tab
- Messages are stored per-tab

### Managing Sessions

#### Active Sessions
- CDP sessions are automatically created when executing commands
- Sessions persist across multiple command executions
- Each tab has its own independent CDP session

#### Terminating Sessions
- Click **"Terminate All CDP Sessions"** to close all active debugger connections
- Progress bar shows termination status (10-second animation)
- Terminates all sessions across all tabs
- Automatically clears all message logs
- Use when you're done testing or experiencing issues

#### Session Cleanup
- Sessions are automatically cleaned up when:
  - Tabs are closed
  - Extension is reloaded
  - Browser restarts

### Display Modes

#### Popup Mode
- Default mode when clicking extension icon
- Compact interface (900px wide)
- Closes when clicking outside
- Best for quick command execution

#### Side Panel Mode
- Click **"Dock to Right"** button
- Opens in Chrome's side panel
- Stays open while browsing
- Perfect for continuous monitoring
- Accessible via View → Side Panel

#### Window Mode
- Click **"Open in Window"** button
- Opens in dedicated popup window (750x800px)
- Can be resized and repositioned
- Always on top option available
- Ideal for multi-monitor setups

## 📚 CDP Commands Reference

### Runtime Domain
Execute JavaScript and interact with the runtime:

```javascript
// Evaluate expression
Runtime.evaluate
{"expression": "2 + 2", "returnByValue": true}

// Call function
Runtime.callFunctionOn
{"functionDeclaration": "function() { return this.value; }", "objectId": "..."}

// Get object properties
Runtime.getProperties
{"objectId": "..."}
```

### Page Domain
Control page behavior:

```javascript
// Navigate
Page.navigate
{"url": "https://example.com"}

// Reload
Page.reload
{"ignoreCache": true}

// Screenshot
Page.captureScreenshot
{"format": "png", "quality": 100}

// Print to PDF
Page.printToPDF
{"landscape": false, "printBackground": true}

// Get frame tree
Page.getFrameTree
{}
```

### DOM Domain
Manipulate the DOM:

```javascript
// Get document
DOM.getDocument
{"depth": -1}

// Query selector
DOM.querySelector
{"nodeId": 1, "selector": "h1"}

// Get outer HTML
DOM.getOuterHTML
{"nodeId": 5}

// Set attribute
DOM.setAttributeValue
{"nodeId": 5, "name": "class", "value": "highlight"}
```

### Network Domain
Control network behavior:

```javascript
// Enable network tracking
Network.enable
{}

// Set user agent
Network.setUserAgentOverride
{"userAgent": "CustomBot/1.0"}

// Set extra headers
Network.setExtraHTTPHeaders
{"headers": {"X-Custom-Header": "value"}}

// Get cookies
Network.getCookies
{"urls": ["https://example.com"]}

// Disable cache
Network.setCacheDisabled
{"cacheDisabled": true}
```

### Debugger Domain
Debug JavaScript:

```javascript
// Enable debugger
Debugger.enable
{}

// Pause execution
Debugger.pause
{}

// Resume execution
Debugger.resume
{}
```

### Input Domain
Simulate user input:

```javascript
// Dispatch key event
Input.dispatchKeyEvent
{"type": "keyDown", "key": "Enter"}

// Dispatch mouse event
Input.dispatchMouseEvent
{"type": "mousePressed", "x": 100, "y": 200, "button": "left"}

// Insert text
Input.insertText
{"text": "Hello World"}
```

### Emulation Domain
Emulate device conditions:

```javascript
// Set device metrics
Emulation.setDeviceMetricsOverride
{
  "width": 375,
  "height": 667,
  "deviceScaleFactor": 2,
  "mobile": true
}

// Set geolocation
Emulation.setGeolocationOverride
{"latitude": 37.7749, "longitude": -122.4194, "accuracy": 100}

// Enable touch emulation
Emulation.setTouchEmulationEnabled
{"enabled": true}
```

### Storage Domain
Manage browser storage:

```javascript
// Get cookies
Storage.getCookies
{}

// Set cookies
Storage.setCookies
{"cookies": [{"name": "test", "value": "123", "domain": "example.com"}]}

// Clear data
Storage.clearDataForOrigin
{"origin": "https://example.com", "storageTypes": "all"}
```

### Performance Domain
Monitor performance:

```javascript
// Enable performance tracking
Performance.enable
{}

// Get metrics
Performance.getMetrics
{}
```

### Console Domain
Access console:

```javascript
// Enable console
Console.enable
{}

// Clear messages
Console.clearMessages
{}
```

### Security Domain
Manage security settings:

```javascript
// Ignore certificate errors
Security.setIgnoreCertificateErrors
{"ignore": true}
```

### CSS Domain
Manipulate CSS:

```javascript
// Enable CSS tracking
CSS.enable
{}

// Get matched styles
CSS.getMatchedStylesForNode
{"nodeId": 5}

// Add rule
CSS.addRule
{"styleSheetId": "...", "ruleText": ".new-class { color: red; }"}
```

### Overlay Domain
Visual overlays:

```javascript
// Highlight node
Overlay.highlightNode
{"nodeId": 5}

// Hide highlight
Overlay.hideHighlight
{}
```

## 💡 Use Cases & Examples

### Web Scraping & Data Extraction

Extract data from dynamic websites:

```javascript
// Get all links
Runtime.evaluate
{
  "expression": "Array.from(document.querySelectorAll('a')).map(a => ({text: a.textContent, href: a.href}))",
  "returnByValue": true
}

// Get form values
Runtime.evaluate
{
  "expression": "Array.from(document.querySelectorAll('input')).map(i => ({name: i.name, value: i.value}))",
  "returnByValue": true
}
```

### Automated Testing

Automate browser interactions:

```javascript
// 1. Navigate to test page
Page.navigate
{"url": "https://example.com/login"}

// 2. Fill username
Runtime.evaluate
{"expression": "document.querySelector('#username').value = 'testuser'"}

// 3. Fill password
Runtime.evaluate
{"expression": "document.querySelector('#password').value = 'password123'"}

// 4. Click submit
Runtime.evaluate
{"expression": "document.querySelector('#submit').click()"}
```

### Performance Analysis

Measure page performance:

```javascript
// 1. Enable performance tracking
Performance.enable
{}

// 2. Navigate to page
Page.navigate
{"url": "https://example.com"}

// 3. Get metrics
Performance.getMetrics
{}
```

### Screenshot Automation

Capture page screenshots:

```javascript
// Full page screenshot
Page.captureScreenshot
{
  "format": "png",
  "fromSurface": true
}

// Specific viewport
Page.captureScreenshot
{
  "format": "jpeg",
  "quality": 80,
  "clip": {
    "x": 0,
    "y": 0,
    "width": 1280,
    "height": 720,
    "scale": 1
  }
}
```

### Mobile Device Emulation

Test mobile responsiveness:

```javascript
// iPhone 12 Pro
Emulation.setDeviceMetricsOverride
{
  "width": 390,
  "height": 844,
  "deviceScaleFactor": 3,
  "mobile": true
}

// Enable touch
Emulation.setTouchEmulationEnabled
{"enabled": true}
```

### Network Monitoring

Monitor network requests:

```javascript
// 1. Enable network
Network.enable
{}

// 2. Navigate (watch the monitor for network events)
Page.navigate
{"url": "https://example.com"}

// 3. Get all cookies
Network.getCookies
{}
```

### Content Manipulation

Modify page content:

```javascript
// Change page title
Runtime.evaluate
{"expression": "document.title = 'New Title'"}

// Inject CSS
Runtime.evaluate
{
  "expression": "const style = document.createElement('style'); style.textContent = 'body { background: black; color: white; }'; document.head.appendChild(style);"
}

// Hide elements
Runtime.evaluate
{"expression": "document.querySelectorAll('.ad').forEach(el => el.style.display = 'none')"}
```

### Cookie Management

Manage browser cookies:

```javascript
// Get all cookies
Network.getCookies
{}

// Set cookie
Network.setCookie
{
  "name": "session_id",
  "value": "abc123",
  "domain": ".example.com",
  "path": "/",
  "secure": true,
  "httpOnly": true
}

// Delete cookies
Network.clearBrowserCookies
{}
```

### Debugging JavaScript

Debug running JavaScript:

```javascript
// 1. Enable debugger
Debugger.enable
{}

// 2. Evaluate with console logs
Runtime.evaluate
{
  "expression": "console.log('Debug point 1'); myFunction(); console.log('Debug point 2');",
  "awaitPromise": true
}
```

## 🏗️ Architecture

### Project Structure

```
CDP Commander/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Main UI interface
├── popup.js              # UI logic and event handlers
├── background.js         # Service worker for CDP execution
├── content.js            # Content script for frame discovery
├── icon16.png           # Extension icon (16x16)
├── icon48.png           # Extension icon (48x48)
├── icon128.png          # Extension icon (128x128)
└── README.md            # This file
```

### Component Overview

#### manifest.json
- Defines extension metadata and permissions
- Declares Manifest V3 compliance
- Specifies required permissions:
  - `tabs`: Access to tab information
  - `debugger`: CDP access
  - `scripting`: Content script injection
  - `sidePanel`: Side panel support
  - `<all_urls>`: Access to all websites

#### popup.html
- Main user interface
- Responsive design (supports popup, side panel, and window modes)
- Styled with vanilla CSS (no external dependencies)
- Contains:
  - Header with title and terminate button
  - Dock controls (right panel / new window)
  - Tab selector with refresh button
  - Frame selector with refresh button
  - CDP method input with autocomplete
  - Parameters textarea (JSON input)
  - Execute button
  - Result display panel
  - CDP Message Monitor with filtering and search

#### popup.js
- UI logic and user interaction handling
- Key functions:
  - `loadCurrentTab()`: Gets the active tab
  - `refreshTabs()`: Loads all accessible tabs
  - `refreshFrames()`: Discovers frames via content script
  - `executeCDP()`: Sends CDP command to background
  - `loadExistingMessages()`: Loads message history
  - `renderMessages()`: Displays CDP messages
  - Autocomplete implementation for CDP methods
  - Message filtering and search
- Maintains state:
  - `currentTab`: Currently selected tab
  - `tabs`: Array of available tabs
  - `frames`: Array of frames in selected tab
  - `messages`: CDP message log
  - `currentFilter`: Active message filter

#### background.js
- Service worker (background script)
- Handles CDP session management
- Key functions:
  - `executeCDPCommand()`: Executes CDP via debugger API
  - `attachDebugger()`: Attaches debugger to tab
  - `getCDPFrameId()`: Maps frame IDs to CDP frame IDs
  - `terminateAllSessions()`: Cleans up all sessions
  - `logMessage()`: Stores and broadcasts messages
- Maintains state:
  - `activeSessions`: Map of active debugger sessions
  - `messagesByTab`: Per-tab message storage
  - `currentMonitoringTabId`: Currently monitored tab
- Event listeners:
  - `chrome.runtime.onMessage`: Handles popup requests
  - `chrome.debugger.onDetach`: Cleanup on detach
  - `chrome.debugger.onEvent`: Captures CDP events
  - `chrome.tabs.onRemoved`: Cleanup on tab close

#### content.js
- Injected into web pages to discover frames
- Executed on-demand (not persistent)
- Functions:
  - `discoverFrames()`: Finds all iframes in the page
  - Returns frame metadata (ID, URL, name, type)
- Handles cross-origin restrictions gracefully

### Data Flow

```
User Interaction (popup.js)
        ↓
    Validate Input
        ↓
Chrome Message API
        ↓
Background Script (background.js)
        ↓
    Attach Debugger (if needed)
        ↓
    Map Frame ID
        ↓
chrome.debugger.sendCommand()
        ↓
    Chrome DevTools Protocol
        ↓
    Browser Engine
        ↓
    Response/Event
        ↓
    Log & Broadcast
        ↓
    Update UI (popup.js)
```

### Message Flow

#### Outgoing Messages (Popup → Background)
```javascript
{
  action: 'executeCDP',
  tabId: number,
  frameId: string,
  method: string,
  params: object
}
```

#### CDP Messages (Background → Browser)
```javascript
chrome.debugger.sendCommand(
  {tabId: number},
  method: string,
  params: object
)
```

#### Message Logs (Background → Popup)
```javascript
{
  action: 'cdpMessage',
  message: {
    direction: 'outgoing' | 'incoming',
    method: string,
    params?: object,
    result?: any,
    error?: string,
    timestamp: number,
    tabId: number
  }
}
```

### Session Management

1. **Session Creation**:
   - First CDP command triggers debugger attachment
   - `Page.enable` and `Runtime.enable` called automatically
   - Session stored in `activeSessions` Map

2. **Session Reuse**:
   - Subsequent commands reuse existing session
   - No re-attachment needed

3. **Session Termination**:
   - Manual: "Terminate All CDP Sessions" button
   - Automatic: Tab close, extension reload, browser restart
   - Cleanup: Remove from Map, clear messages, detach debugger

### Frame Handling

1. **Frame Discovery**:
   - Content script injected into page
   - Queries `document.querySelectorAll('iframe')`
   - Returns frame metadata

2. **Frame ID Mapping**:
   - Extension uses custom IDs: `"main"`, `"frame-0"`, `"frame-1"`
   - Background converts to CDP frame IDs
   - Uses `Page.getFrameTree` for mapping

3. **Frame Targeting**:
   - Main frame: Uses top-level frame ID
   - Iframes: Includes `frameId` in CDP params

## 🔍 Troubleshooting

### Common Issues

#### "Another debugger is already attached"

**Problem**: Another debugging session is active (DevTools, another extension, etc.)

**Solutions**:
- Close Chrome DevTools if open
- Click "Terminate All CDP Sessions"
- Close and reopen the tab
- Restart the browser

#### "No accessible tabs found"

**Problem**: No valid tabs available for debugging

**Solutions**:
- Open a regular web page (not chrome://, chrome-extension://, or Chrome Web Store)
- Refresh the tabs list
- Check that the extension has proper permissions

#### "Error loading frames"

**Problem**: Content script injection failed

**Solutions**:
- Refresh the page
- Click "Refresh Frames"
- Check browser console for errors
- Ensure the page URL is accessible (not restricted)

#### Commands fail silently

**Problem**: CDP session not properly established

**Solutions**:
- Click "Terminate All CDP Sessions"
- Refresh the tab
- Try re-executing the command
- Check the Message Monitor for error details

#### Autocomplete not working

**Problem**: Input event listeners not initialized

**Solutions**:
- Reload the extension
- Close and reopen the popup
- Type the full method name manually

#### Messages not appearing in monitor

**Problem**: Message broadcasting issue or wrong tab selected

**Solutions**:
- Ensure correct tab is selected
- Check that messages are for the current tab
- Clear and refresh the message log
- Reopen the popup

### Debug Mode

To enable detailed logging:

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Filter by "CDP Commander" or check background script logs
4. Look for error messages or warnings

### Performance Issues

If the extension becomes slow:

1. Clear message logs (100,000 message limit per tab)
2. Terminate unused CDP sessions
3. Close unused tabs
4. Reduce message history limit (modify code if needed)

### Extension Won't Load

**Manifest V3 Requirements**:
- Chrome 88+ required
- Ensure `manifest.json` is valid JSON
- Check for permission issues
- Verify all files are present

## ❓ FAQ

### General Questions

**Q: What is Chrome DevTools Protocol (CDP)?**
A: CDP is a protocol that allows tools to interact with Chromium-based browsers. It provides programmatic access to browser internals like DOM, network, performance, and more.

**Q: Do I need programming knowledge to use this?**
A: Basic knowledge of JSON and CDP commands is helpful, but the autocomplete feature and examples make it accessible for beginners.

**Q: Is this safe to use?**
A: Yes, but be cautious. CDP commands can modify pages, access sensitive data, and affect browser behavior. Only execute commands you understand.

**Q: Does this work with other Chromium browsers?**
A: Yes, it should work with Edge, Brave, Opera, and other Chromium-based browsers with minor adjustments.

### Technical Questions

**Q: How many tabs can I debug simultaneously?**
A: You can have active sessions on multiple tabs, but can only execute commands on one tab at a time.

**Q: What's the message history limit?**
A: 100,000 messages per tab. Older messages are automatically removed.

**Q: Can I debug extension pages?**
A: No, chrome-extension:// and chrome:// URLs are filtered out for security reasons.

**Q: Does this interfere with DevTools?**
A: CDP sessions are exclusive. Close DevTools before using this extension, or vice versa.

**Q: Are CDP commands persistent?**
A: No, effects (like enabled domains) are session-specific. Closing the session resets state.

### Privacy & Security

**Q: Does this extension collect data?**
A: No, all data stays local. No analytics, tracking, or external communication.

**Q: Can websites detect this extension?**
A: Websites can detect debugger attachment via `navigator.webdriver` and other signals.

**Q: Is it safe to enter sensitive data in CDP commands?**
A: Data remains local, but be cautious with credentials or API keys in command parameters.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check existing issues first
2. Include Chrome version and extension version
3. Provide steps to reproduce
4. Include error messages and screenshots
5. Share relevant CDP commands

### Feature Requests

1. Describe the use case
2. Explain expected behavior
3. Provide example CDP commands or workflows
4. Consider implementation complexity

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Test thoroughly
5. Update documentation
6. Submit PR with clear description

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/cdp-commander.git

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select the repository folder

# Make changes
# Reload extension after each change (chrome://extensions/)
```


## 📄 License

MIT License

Copyright (c) 2025 CDP Commander

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🔗 Resources

### Official Documentation
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [Debugger API](https://developer.chrome.com/docs/extensions/reference/debugger/)

### CDP Domain References
- [Runtime Domain](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/)
- [Page Domain](https://chromedevtools.github.io/devtools-protocol/tot/Page/)
- [DOM Domain](https://chromedevtools.github.io/devtools-protocol/tot/DOM/)
- [Network Domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/)
- [Debugger Domain](https://chromedevtools.github.io/devtools-protocol/tot/Debugger/)


**Made with ❤️ by developers, for developers**

*Happy debugging! 🚀*
