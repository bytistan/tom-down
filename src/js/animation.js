export class Animation {
    openLoadScreen(load,main) {
        loader.style.display = "block";

        main.style.opacity = 0.15;
        main.style.pointerEvents = "none";
    }

    closeLoadScreen(load,main) {
        loader.style.display = "none";

        main.style.opacity = 1;
        main.style.pointerEvents = "auto";
    }

    openDownloadButton(downloadIcon, thumbnailImage, downloadButton, thumbnailUrl) {
        downloadIcon.src = "resources/icon/green-download.svg";
        thumbnailImage.src = thumbnailUrl;     
        downloadButton.disabled = false;
    }

    closeDownloadButton(downloadIcon,downloadButton) {
        downloadIcon.src = "resources/icon/red-download.svg"
        downloadButton.disabled = true;
    }

    downloadButtonBounce(downloadButton) {
        downloadButton.classList.add("bounce");

        setTimeout(() => {
            downloadButton.classList.remove("bounce");
        }, 500); 
    }
}
