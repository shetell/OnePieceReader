var url = './Info.pdf';

var isFullScreen = false;

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    pageNumIsPending_right = null;


const scale = 1;
var canvas = document.querySelector('#pdf-render');
var canvas_left = document.querySelector('#pdf-render-left');
var canvas_right = document.querySelector('#pdf-render-right');
canvas_left.width = 0;
canvas_right.width = 0;
canvas_left.style.display = "block";
canvas_right.style.display = "none";
const ctx = canvas.getContext('2d'),
    ctx_left = canvas_left.getContext('2d');
ctx_right = canvas_right.getContext('2d');


// Render the page
const renderPage = num => {
    pageIsRendering = true;
    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        var viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (isFullScreen) {
            canvas.height = window.screen.height;
            var s = canvas.height / viewport.height;
            viewport = page.getViewport({ scale: s });
            canvas.width = (viewport.width * canvas.height) / viewport.height;
        }

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport,
        };

        page.render(renderCtx).promise.then(() => {});

        // Output current page
        document.querySelector('#page-num').textContent = num;
    });

    // Get another page
    if (num + 1 <= pdfDoc.numPages) {
        pdfDoc.getPage(num + 1).then(page => {
            // Set scale
            var viewport = page.getViewport({ scale });
            canvas_left.height = viewport.height;
            canvas_left.width = viewport.width;

            if (isFullScreen) {
                canvas_left.height = window.screen.height;
                var s = canvas_left.height / viewport.height;
                viewport = page.getViewport({ scale: s });
                canvas_left.width = (viewport.width * canvas_left.height) / viewport.height;
            }
            const renderCtx = {
                canvasContext: ctx_left,
                viewport: viewport,
            };

            page.render(renderCtx).promise.then(() => {});

            //canvas_right
            // Set scale
            var viewport = page.getViewport({ scale });
            canvas_right.height = viewport.height;
            canvas_right.width = viewport.width;

            if (isFullScreen) {
                canvas_right.height = window.screen.height;
                var s = canvas_right.height / viewport.height;
                viewport = page.getViewport({ scale: s });
                canvas_right.width = (viewport.width * canvas_right.height) / viewport.height;
            }
            const renderCtx_right = {
                canvasContext: ctx_right,
                viewport: viewport,
            };

            page.render(renderCtx_right).promise.then(() => {});
        });
    }
};

// Check for pages rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num,
            pageNumIsPending_right = num + 1;
    } else {
        renderPage(num);
    }
};

// Show Prev Page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum -= 2;
    renderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum += 2;
    renderPage(pageNum);
};

// Open File
const OpenFile = () => {
    var input = document.createElement('input');
    input.type = 'file';
    input.id = 'file';
    input.name = 'file';
    input.onchange = e => {
        var file = e.target.files[0];
        var filepath = window.URL.createObjectURL(file);
        url = filepath;
        get_document(url);
    }
    input.click();
}

get_document(url);

// Get Document
function get_document(url) {
    pdfjsLib
        .getDocument(url)
        .promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;

            document.querySelector('#page-count').textContent = pdfDoc.numPages;

            renderPage(pageNum);
        })
        .catch(err => {
            // Display error
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(err.message));
            document.querySelector('body').insertBefore(div, canvas);
            // Remove top bar
            document.querySelector('.top-bar').style.display = 'none';
        });
}
// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
document.querySelector('#open-file').addEventListener('click', OpenFile);
document.addEventListener("fullscreenchange", () => {
    if (isFullScreen) {
        isFullScreen = false;
        renderPage(pageNum);
        return;
    }
    if (!isFullScreen) {
        isFullScreen = true;
        renderPage(pageNum);
        return;
    }
});
document.onkeydown = disableRefresh;

function disableRefresh(evt) {
    evt = (evt) ? evt : window.event
    if (evt.keyCode) {
        if (evt.keyCode == 37 || evt.keyCode == 38) { //Left & Up
            showPrevPage();
        }
        if (evt.keyCode == 39 || evt.keyCode == 40) { //Right & Down
            showNextPage();
        }
        if (evt.keyCode == 70) { // F
            const center = document.querySelector('#render_area');
            center.requestFullscreen();
        }
    }
}

function on_off(type) {
    var btn = document.getElementsByClassName("btn-on")[0];
    var circle = document.getElementsByClassName("btn-on-circle")[0];
    var text = document.getElementsByClassName("btn-on-text")[0];

    if (!type) {
        btn.style = "background-color: #ccc;"
        circle.style = "right: 40px;background-color: #888;box-shadow: 0 0 10px #888;";
        text.style = "left: 25px;color: #888;";
        text.innerText = "OFF";
        switchCanvas();
    } else {
        btn.style = ""
        circle.style = "";
        text.style = "";
        text.innerText = "ON";
        switchCanvas();
    }
    btn.setAttribute("onclick", "on_off(" + !type + ")"); // 修改状态
}

function switchCanvas() {
    if (canvas_left.style.display == "none") {
        canvas_left.style.display = "block";
    } else if (canvas_left.style.display == "block") {
        canvas_left.style.display = "none";
    }
    if (canvas_right.style.display == "none") {
        canvas_right.style.display = "block";
    } else if (canvas_right.style.display == "block") {
        canvas_right.style.display = "none";
    }
}