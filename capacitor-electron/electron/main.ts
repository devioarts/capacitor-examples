import { app, BrowserWindow } from 'electron';
import * as path from 'path';

import express from 'express';
import type { AddressInfo } from 'net';

const isDev = !app.isPackaged;
/*
 * Function to start a local HTTP server using express
 */
async function startLocalHttp(distDir: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const web = express();
		web.use(express.static(distDir));
		const server = web.listen(0, '127.0.0.1', () => {
			const addr = server.address() as AddressInfo;
			resolve(addr.port);
		});
		server.on('error', reject);
	});
}


function createWindow() {
	const win = new BrowserWindow({
		fullscreen: false,
		frame: false,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.cjs'),
			sandbox: false,
		},
	});

	if (isDev) {
		win.loadURL('http://localhost:6001');
	} else {
		const DIST_DIR = path.join(__dirname, '../dist');
		startLocalHttp(DIST_DIR).then((port) => {
			win.loadURL(`http://localhost:${port}/index.html`);
		});
	}
	// Open the DevTools.
	win.webContents.openDevTools();

}

app.whenReady().then(() => {
	createWindow();
});

app.on('before-quit', async () => {
	// events to be handled before quitting the app
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
