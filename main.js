const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')

const ytdl = require('ytdl-core');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow () {
  const win = new BrowserWindow({
    width: 480,
    height: 620,
    icon: path.join(__dirname, './resources/icon/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, 
      enableRemoteModule: false,
      nodeIntegration: false
    }
  })

  win.loadFile('src/html/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle("dialog:save", async (event, file) => {
    const result = await dialog.showSaveDialog({
        title: "Save File",
        defaultPath: `${file.name}.${file.format}`,
        filters: [{ name: 'Video Files', extensions: ['mp4','mp3'] }],
    });
    return result.filePath;
});

ipcMain.handle("control-video", async(event, videoUrl) => {
    try {
        const info = await ytdl.getInfo(videoUrl);
        const thumbnailUrl = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        const valid = ytdl.validateURL(videoUrl);

        return {"thumbnailUrl":thumbnailUrl,"valid":valid}; 
    } catch (error) {
        console.error('Error:', error.message);
        return {"valid":false}; 
    }
});

function getUserAgents() {
    const userAgentPath = path.join(__dirname, 'resources/user-agent.txt'); 
    const userAgentData = fs.readFileSync(userAgentPath, 'utf-8');
    return userAgentData.split('\n').filter(ua => ua.trim() !== '');
}

function getRandomUserAgent(userAgents) {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}

ipcMain.handle('download-video', async (event, data) => {
    try {
        const userAgents = getUserAgents();
        const selectedUserAgent = getRandomUserAgent(userAgents);

        // Set up the YT-DLP command
        const qualityOption =  '' // data.format == "mp4" ? `-f "${data.quality}"` : '';

        // Create the new file name
        const basePath = path.basename(data.path, path.extname(data.path)); // Get the file name without extension
        const outputPath = path.join(path.dirname(data.path), `${basePath}.${data.format}`); // Append the new extension

        const command = data.format == "mp4" ? `yt-dlp -o "${outputPath}" --no-warnings --user-agent "${selectedUserAgent}" ${qualityOption} "${data.url}"` : `yt-dlp -o "${outputPath}" --no-warnings --user-agent "${selectedUserAgent}" --extract-audio --audio-format mp3 ${qualityOption} "${data.url}"`;

        // Execute the command
        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("Video download error:", error);
                    reject({ success: false, error: error.message });
                } else {
                    console.log("Video download completed:", stdout);
                    resolve({ success: true });
                }
            });
        });

        // Send a notification when the download is complete
        return { "success": true }; 
    } catch (error) {
        console.error("Video download error:", error);
        return { "success": false, "error": error.message };
    }
});
