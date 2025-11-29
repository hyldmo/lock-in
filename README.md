# lock-in

Chrome extension for blocking distracting websites and getting back to work.

## Local Development

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Build the extension:
```bash
yarn dev
```
This will watch for changes and rebuild automatically.

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. After making changes:
   - The extension will rebuild automatically (if `yarn dev` is running)
   - Go to `chrome://extensions/` and click the refresh icon on your extension card

### Build for Production

```bash
yarn prod
```

This creates an optimized build in the `dist` folder.
