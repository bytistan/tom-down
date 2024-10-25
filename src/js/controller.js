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
            if (this.settings.file.path == null) {
                alert("You are not enter the path");
                return
            }
            this.animation.downloadButtonBounce(this.button.download);

            this.animation.openLoadScreen(this.div.loader,this.div.main);

            const url = this.input.url.value;
            this.settings.file.url = url; 

            const message = await window.electron.ipcRenderer.invoke('download-video', this.settings.file);

            this.animation.closeLoadScreen(this.div.loader,this.div.main);

        } catch (error) {
            console.error("Error validating URL:", error);
            this.animation.closeDownloadButton(this.img.download,this.button.download);
        }  
    }
    
    isValidYouTubeUrl(url) {
        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
        return regex.test(url);
    }

    async urlValid(event) {
        try {
            const clipboard = event.clipboardData;
            const url = clipboard ? clipboard.getData("text") : this.input.url.value; 

            if (!this.isValidYouTubeUrl(url)) {
                this.animation.closeDownloadButton(this.img.download,this.button.download);
                return 
            }

            this.animation.openLoadScreen(this.div.loader,this.div.main);
                    
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
        ["paste","input"].forEach((eventType) => {
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
