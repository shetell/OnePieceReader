var url = './Info.pdf';

var isFullScreen = false;

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    pageNumIsPending_right = null;


const scale = 1.33,
    canvas = document.querySelector('#pdf-render'),
    canvas_right = document.querySelector('#pdf-render-right');
canvas_right.width = 0;
console.log(canvas);
const ctx = canvas.getContext('2d'),
    ctx_right = canvas_right.getContext('2d');


// Render the page
const renderPage = num => {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (isFullScreen) {
            canvas.height = window.screen.height;
            canvas.width = (viewport.width * canvas.height) / viewport.height;
        }

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector('#page-num').textContent = num;
    });

    // Get another page
    pdfDoc.getPage(num + 1).then(page => {
        // Set scale
        const viewport = page.getViewport({ scale });
        canvas_right.height = viewport.height;
        canvas_right.width = viewport.width;
        if (isFullScreen) {
            canvas_right.height = window.screen.height;
            canvas_right.width = (viewport.width * canvas_right.height) / viewport.height;
        }
        const renderCtx = {
            canvasContext: ctx_right,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending_right !== null) {
                renderPage(pageNumIsPending_right);
                pageNumIsPending_right = null;
            }
        });

        // Output current page
        document.querySelector('#page-num').textContent = num;
    });
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
    queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum += 2;
    queueRenderPage(pageNum);
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
            isFullScreen = true;
        }
        if (evt.keyCode == 27) { // ESC
            isFullScreen = false;
        }
    }
}