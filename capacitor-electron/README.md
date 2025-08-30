# React + TypeScript + Vite
base
```shell
npm create vite@latest . -- --template react-ts
mkdir dist
npm i @capacitor/core
npm i -D @capacitor/cli
```
Initiate capacitor
```shell
npx cap init
```
add ios/android
```shell
# add ios/android support
npm i @capacitor/android @capacitor/ios
# add electron support
npm i -D electron electron-builder concurrently
npm i -D @electron/rebuild @types/electron @types/node 
# add express (for electron localserver)
# not required if you want to use local path based
npm i express wait-on
npm i -D @types/express
# first build
npm run build
# add android
npx cap add android
# add ios
# if you want to use Podfile
npx cap add ios
# if you want to use SPM
npx cap add ios --packagemanager SPM
```

### vite.config.ts
```js
import path from "path"
// ...
// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server:{
        host: '0.0.0.0',
        port: 6001,
        strictPort: true
    }
})
```
### tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### package.json scripts
```json
{
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "copy": "npx cap copy",
    "copy-inline": "npx cap copy --inline",
    "sync": "npx cap sync",
    "open-ios": "npx cap open ios",
    "open-android": "npx cap open android",
    "electron:build": "esbuild electron/main.ts --bundle --platform=node --external:electron --outfile=electron/main.cjs && esbuild electron/preload.cjs --bundle --platform=node --external:electrons",
    "electron:watch": "esbuild electron/main.ts --bundle --platform=node --external:electron --outfile=electron/main.cjs --watch",
    "electron:dev": "concurrently \"vite\" \"npm run electron:watch\" \"wait-on http://localhost:6001 && electron electron/main.cjs\"",
    "electron:dist": "npm run build && npm run electron:build && electron-builder",
    "electron:dist:win": "npm run build && npm run electron:build && electron-builder -w --x64",
    "electron:dist:mac": "npm run build && npm run electron:build && electron-builder -m --arm64",
    "electron:dist:lnx": "npm run build && npm run electron:build && electron-builder -l --x64"
  }
```
### package.json electron-builder config
```json
{
  "build": {
    "appId": "com.devioarts.myelectronapp",
    "productName": "My Electron App",
    "directories": {
      "buildResources": "public",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/main.cjs",
      "electron/preload.cjs"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/vite.ico"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": true,
      "allowToChangeInstallationDirectory": true
    }
  },
  "main": "electron/main.cjs"
}
```





This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
