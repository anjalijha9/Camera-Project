

let video = document.querySelector("video");
let vidbtn = document.querySelector("button#record");
let capbtn = document.querySelector("button#capture");
let body = document.querySelector("body");
let galleryBtn = document.querySelector("#gallery");

let filters = document.querySelectorAll(".filters");

let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");

let contraints = { video : true };
let mediaRecorder;
let isRecording = false;
let chunks = [];


let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

galleryBtn.addEventListener("click", function() {
    location.assign("gallery.html");
})

let options = { mimeType: "video/webm; codecs=vp9" };

let filter = " "; //canvas use image filter daalne ke  liye

for(let i = 0; i < filters.length; i++) {
    filters[i].addEventListener("click", function(e) {
        filter = e.currentTarget.style.backgroundColor;
        // remove filter if exist 
        // apply new filter using the above 
        removeFilter();
        applyFilter(filter);
       
    })
}

// Event listener for zoom-in button 
zoomIn.addEventListener("click", function() {
    if(currZoom < maxZoom){
        currZoom += 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

// Event listener for zoom-out button 
zoomOut.addEventListener("click", function() {
    if(currZoom > minZoom){
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

vidbtn.addEventListener("click", function() {

    let innerDiv = vidbtn.querySelector("div");

    if(isRecording){
        mediaRecorder.stop();
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    }
    else{
        mediaRecorder.start();
        filter = "";
        removeFilter();
        video.style.transform = `scale(1)`;
        currZoom = 1;
        isRecording = true;
        innerDiv.classList.add("record-animation");
    }
});

//Event listener when we click capture button
capbtn.addEventListener("click", function() {
    let innerDiv = capbtn.querySelector("div");
  innerDiv.classList.add("capture-animation");
  setTimeout(function () {
    innerDiv.classList.remove("capture-animation");
  }, 500);
  capture();
});


//navigator ek object he and then hm uske andar hmne ek object mediaDevices ke andar ek promise use kiya he
navigator.mediaDevices.getUserMedia(contraints).then(function (mediaStream) {
    video.srcObject = mediaStream;
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", function(e) {
        chunks.push(e.data);
    });


    mediaRecorder.addEventListener("stop", function(e) {
        //Blob is the large raw data jo chunks ke data ko tukde me jama krte he
        let blob = new Blob(chunks, {type : "video/mov"});
        addMedia("video", blob);
        chunks = [];

        // let url = URL.createObjectURL(blob);

        // let a = document.createElement("a");
        // a.href = url;
        // a.download = "video/mov";
        // a.click();
        // a.remove();
    });
});

// jo bhi filters and zoom vgera ke changes krne he canvas me jo issi function me honge when we capture a photo
function capture() {
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let ctx = canvas.getContext("2d");

    //phle canvas ke origin ko center me laayenge nd the zoom krenge 
    //mtlb-->scale and then vaapis origin(0,0) pr daalenge jisse image acche se build ho 
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(video, 0, 0);
    //jo hmne canvas se rect bnaya he usko filter color de rhhe
    if(filter != 0){
        ctx.fillStyle = filter;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    // let a = document.createElement("a");
    // a.download = "image.jpg";
    // a.href = canvas.toDataURL();
    addMedia("img", canvas.toDataURL());
    // a.click();
    // a.remove();
}

function applyFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    //body pr append kr rhe filter color
    body.appendChild(filterDiv);
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if(filterDiv){
        filterDiv.remove();
    }
}

