# TLDR.ai Chrome Extension

A Chrome extension that provides AI-powered summarization of web pages.

## Features

- **One-click summarization** of any web page
- **Smart caching** - remembers previously summarized pages
- **Resummarize option** - generate fresh summaries when needed

## Installation

### For Users

1. **Download the extension**
   ```bash
   git clone https://github.com/yourusername/tldr.ai.git
   cd tldr.ai
   ```

2. **Build the extension**
   ```bash
   npm install
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory
   - The extension should now appear in your extensions list

4. **Use the extension**
   - Click the TLDR.ai icon in your Chrome toolbar
   - Click "SUMMARIZE" to generate a summary of the current page
   - If the page has been summarized before, you'll see options to show the previous summary or generate a new one

## Project Structure

```
tldr.ai/
├── popup.html          # Main popup interface
├── popup.js            # Popup logic and UI management
├── background.js       # Service worker for background tasks
├── storage.js          # Chrome storage utilities
├── summarizer.js       # AI summarization logic
├── debug.js            # Debugging utilities
├── style.css           # Styling for the popup
├── vite.config.js      # Vite build configuration
├── package.json        # Dependencies and scripts
├── public/
│   ├── manifest.json   # Chrome extension manifest
│   └── icon.png        # Extension icon
└── dist/               # Build assets
```

## For Developers

### File Changes

When developing:

1. **Edit source files** in the root directory
2. **Run `npm run dev`** for automatic rebuilding
3. **Reload the extension** in `chrome://extensions/` (click the refresh icon)
4. **Test changes** by clicking the extension icon

### Debugging

- **Console logs** appear in the popup's DevTools
- **Background script logs** appear in the extension's service worker DevTools
- **Storage debugging** is available through Chrome DevTools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

