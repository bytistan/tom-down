import { Animation } from "./animation.js"; 
import { Settings } from "./settings.js";

export class Controller {
    constructor() {
        this.input = {
            "url": document.getElementById("video-url"),
        }

        this.button = {
            "download": document.getElementById("download") 
        }
        
        this.img = {
            "thumbnail": document.getElementById("thumbnail"),
            "download": document.getElementById("download-icon")
        }

        this.div = {
            "loader":document.getElementById("loader"),
            "main": document.getElementById("main")
        } 
        
        this.animation = new Animation();
        this.settings = new Settings();
    }
    
    async downloadVideo(event) {
        try {
            this.animation.openLoadScreen(this.div.loader,this.div.main);

            const url = this.input.url.value;
            this.settings.file.url = url; 

            const message = await window.electron.ipcRenderer.invoke('download-video', settings.file);

            this.animation.downloadButtonBounce(this.button.download);

            this.animation.closeLoadScreen(this.div.loader,this.div.main);

        } catch (error) {
            console.error("Error validating URL:", error);
            this.animation.closeDownloadButton(this.img.download,this.button.download);
        }  
    }

    async urlValid(event) {
        try {
            this.animation.openLoadScreen(this.div.loader,this.div.main);

            const clipboard = event.clipboardData;
            const url = clipboard ? clipboard.getData("text") : videoUrlInput.value; 

            const response = await window.electron.ipcRenderer.invoke('control-video', url);

            if (response.valid) {   
               this.animation.openDownloadButton(this.img.download,this.img.thumbnail,this.button.download, response.thumbnailUrl); 
            } else {                
               this.animation.closeDownloadButton(this.img.download,this.button.download);
            }

            this.animation.closeLoadScreen(this.div.loader,this.div.main);
        } catch (error) {
            console.error("Error validating URL:", error);
            downloadButton.disabled = true;
        }                       
    } 

    add() {
        ["paste","click"].forEach((eventType) => {
            this.input.url.addEventListener(eventType, async (event) => {
                await this.urlValid(event);
            });
        });

        this.button.download.addEventListener("click", async (event) => {
            await this.downloadVideo(event);
        });
    }

    update() {
        this.add();
        this.settings.update();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const controller = new Controller();
    controller.update();
}); 
