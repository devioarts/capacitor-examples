# React + TypeScript + Vite + Capacitor + Electron

Sample project for React + TypeScript + Vite + Capacitor + Electron

## Instalation

- [From GitHub](#instalation-from-github)
- [From Scratch](#instalation-from-scratch)

## Instalation from GitHub

### Download and extract the repo folder (Linux/Mac)
> To folder capacitor-electron
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=1 capacitor-examples-main/capacitor-electron
cd capacitor-electron
```
> To current folder
```shell
curl -L https://codeload.github.com/devioarts/capacitor-examples/tar.gz/refs/heads/main \
| tar -xz --strip-components=2 capacitor-examples-main/capacitor-electron
```
### Create a dist folder and install dependencies
```shell
# create dist folder
mkdir dist
# install dependencies
npm install
```
### Install iOS + Android
```shell
# first build
npm run dev:build
# add android
npx cap add android
# add ios
# if you want to use Podfile
npx cap add ios
# if you want to use SPM
npx cap add ios --packagemanager SPM
```

## Instalation from scratch
### Prepare the base project
```shell
# create vite project (ReactJS + TypeScript) in current folder
npm create vite@latest . -- --template react-ts
# create dist folder, for compiled files
mkdir dist
# install capacitor
npm i @capacitor/core
npm i -D @capacitor/cli
```
### Initiate capacitor
```shell
npx cap init
```
### Add iOS/Android/Electron support
```shell
# add ios/android support
npm i @capacitor/android @capacitor/ios
# add electron support
npm i -D electron esbuild electron-builder concurrently
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

## Configuration

### vite.config.ts
> I'm using port **6001** for my examples
> if you want to use different port, 
> you need to change the port in 
>- electron/main.ts at this line ***win.loadURL('http://localhost:6001');***
>- package.json in script ***electron:dev***
>- vite.config.ts in server section ***port: 6001,***
>
```js
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
> Add compilerOptions section to tsconfig.json (https://www.typescriptlang.org/tsconfig)
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

### package.json 
#### scripts section
> Changne all scripts section in package.json (or just add new scripts)

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
#### electron-builder sections
> Add the following sections to package.json (https://www.electron.build/configuration)
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

### electron/main.ts
> In createWindow function you can select if you want to use local path or http server
#### http server (express)
> Comment ***import * as url from 'url';*** in the top of the file to have no lint error
```js
if (isDev) {
    win.loadURL('http://localhost:6001');
} else {
    const DIST_DIR = path.join(__dirname, '../dist');
    startLocalHttp(DIST_DIR).then((port) => {
        win.loadURL(`http://localhost:${port}/index.html`);
    });
}
```
#### local path
> Uncomment ***import * as url from 'url';*** in the top of the file
> and comment ***startLocalHttp*** function to have no lint error
```js
if (isDev) {
    win.loadURL('http://localhost:6001');
} else {
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, '../dist/index.html'),
            protocol: 'file:',
            slashes: true,
        })
    );
}
```