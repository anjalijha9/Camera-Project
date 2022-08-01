//Database create/open -> (camera)
//Database objectStore -> gallery
//photo capture / video record -> gallery(obs) store

let dbAccess;
let container = document.querySelector(".container");
let request=indexedDB.open("Camera",1); //opening database=>Camera with version 1

request.addEventListener("success",function(){
    dbAccess=request.result;
});

request.addEventListener("upgradeneeded",function(){
    let db=request.result;
    db.createObjectStore("gallery", {keyPath : "mId" });
});

request.addEventListener("error",function(){
    alert("some error occured");
});

//Jo bhi photo/video capture hogi save krega
function addMedia(type,media){
    //assumption ki tabhi chlega jb dbAccess hoga
    let tx = dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    let data={
        mId : Date.now(),
        type,
        media,
    };
    galleryObjectStore.add(data);
}


function viewMedia() {
    let tx = dbAccess.transaction("gallery","readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let req = galleryObjectStore.openCursor();
    req.addEventListener("success", function() {
        let cursor = req.result;

        if(cursor){
            let div = document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML = `<div class="media-container">
            </div>
            <div class="action-container">
                <button class="media-download">Download</button>
                <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
            </div>`

            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");

            deleteBtn.addEventListener("click", function(e) {
                let mId = e.currentTarget.getAttribute("data-id");
                //UI se card delete krna he
                e.currentTarget.parentElement.parentElement.remove();
                //indexedDb se data delete krna he 
                deleteMediaFromDB(mId);
            })

            if(cursor.value.type == "img") {
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                //it gives us type by .media i.e img or blob
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click", function(e) {
                    let a = document.createElement("a");
                    a.download = "img.jpg";
                    a.href = img.src;
                    a.click();
                    a.remove();
                })
            }
            else{
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                //We create a URL as we can't directly set Blob as video source 
                video.src = window.URL.createObjectURL(cursor.value.media);
                video.addEventListener("mouseenter", function() {
                    video.currentTime = 0;
                    video.play();
                });

                video.addEventListener("mouseleave", function() {
                    video.pause();
                })
                
                video.controls = true;
                video.loop = true;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click", function(e) {
                    let a = document.createElement("a");
                    a.download = "video.mp4";
                    a.href = e.currentTarget.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                })
            }
            container.appendChild(div);
            cursor.continue();
        }
    });
}

function deleteMediaFromDB(mId) {
    //code jisse me delete kr paau
    let tx = dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId)); //as in data-id this is present in string format
}