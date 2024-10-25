export class Settings { 
    constructor() {
        this.file = {
            "quality":"720p",
            "format":"mp3",
            "name":"file",
            "path":null,
            "url":null
        }
    }
    
    addSelect(containerId,targetVariable) {
        const container = document.getElementById(containerId); 
        let child = container.querySelectorAll("div");

        child.forEach((div) => {
            div.addEventListener("click", () => {

                // Reset all child style 
                child.forEach((el) => {
                    el.classList.remove("s-item-selected");
                    el.classList.add("s-item");
                });  
                
                // Add one of them selected
                div.classList.remove("s-item");
                div.classList.add("s-item-selected");
                
                // Get variable  
                const p = div.querySelector("p");
                const name = p.getAttribute("name"); 
                
                // Save variable
                this.file[targetVariable] = name;
                
                if (targetVariable == "format") {
                    document.getElementById("format-text").innerHTML = name; 
                }
            });
        });
    }
    
    addFilePath () {
        // Listen click event
        document.getElementById("file-path").addEventListener("click", async () => {
            
            // Open file dialog
            const filePath = await window.electron.ipcRenderer.invoke("dialog:save", this.file);
        
            // Save file path if selected
            if (filePath) {
                let extracted = filePath.split("/");
                let file = extracted[extracted.length - 1];
                let extractedFile = file.split(".");
                let fileName = extractedFile[0]; 
                
                document.getElementById("file-name").innerHTML = fileName;
               
                this.file.path = filePath;
                this.file.name = fileName;
            } 
        });
    }
    
    update() {
        this.addSelect("quality-box","quality");
        this.addSelect("format-box","format");
        this.addFilePath();
    }
} 
