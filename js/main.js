var url = './Info.pdf';

var isFullScreen = false;

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    pageNumIsPending_right = null;


const scale = 1;
var hasBigPage = false;
var a = { hasBigPage: false };
var position;
var p = { position: 'none' };
var w_h = 0.7;
var normalScale = 0.79;
var normalThreshold = window.screen.height * normalScale * w_h;
var fullScreenThreshold = window.screen.height * w_h;
var render_area = document.querySelector('#render_area');
var canvas = document.querySelector('#pdf-render');
var canvas_left = document.querySelector('#pdf-render-left');
var canvas_right = document.querySelector('#pdf-render-right');
var filename = document.querySelector('#filename');
canvas_left.width = 0;
canvas_right.width = 0;
canvas_left.style.display = "block";
canvas_right.style.display = "none";
const ctx = canvas.getContext('2d'),
    ctx_left = canvas_left.getContext('2d'),
    ctx_right = canvas_right.getContext('2d');

// Render the page
const renderPage = num => {
    pageIsRendering = true;
    var target_height = window.screen.height * normalScale;
    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        var viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var original_height = canvas.height;

        var s = target_height / original_height;
        canvas.height = target_height;
        canvas.width *= s;
        ctx.scale(s, s);
        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport,
        };


        // check big page
        if (viewport.width > 1500) {
            renderOnePage();
            position = 'right';
            if (!isFullScreen) {
                Rotate(ctx, canvas, -90 * Math.PI / 180, original_height);
            }
        } else {
            if (num + 1 <= pdfDoc.numPages) {
                pdfDoc.getPage(num + 1).then(page => {
                    var viewport = page.getViewport({ scale });
                    if (viewport.width > 1500) {
                        renderOnePage();
                        position = 'left';
                        if (!isFullScreen) {
                            Rotate(ctx_left, canvas_left, -90 * Math.PI / 180, target_height);
                        }
                    } else {
                        a.hasBigPage = false;
                        hasBigPage = false;
                        //console.log('!');
                    }
                });
            }
        }

        page.render(renderCtx).promise.then(() => {});



        // Output current page
        document.querySelector('#page-num').textContent = pageNum;
        return;

    });

    // Get another page
    if (num + 1 <= pdfDoc.numPages) {
        pdfDoc.getPage(num + 1).then(page => {
            // Set scale
            var viewport = page.getViewport({ scale });
            canvas_left.height = viewport.height;
            canvas_left.width = viewport.width;

            canvas_left.height = target_height;
            var s = canvas_left.height / viewport.height;
            viewport = page.getViewport({ scale: s });
            canvas_left.width = (viewport.width * canvas_left.height) / viewport.height;

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

            canvas_right.height = target_height;
            var s = canvas_right.height / viewport.height;
            viewport = page.getViewport({ scale: s });
            canvas_right.width = (viewport.width * canvas_right.height) / viewport.height;

            const renderCtx_right = {
                canvasContext: ctx_right,
                viewport: viewport,
            };

            page.render(renderCtx_right).promise.then(() => {});
        });
    }
    //fitWindowSize();

};

function fullScreenRenderPage(num) {
    var target_height = window.screen.height * 1;
    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        var viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var original_height = canvas.height;

        var s = target_height / original_height;
        canvas.height = target_height;
        canvas.width *= s;



        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport,
        };

        // check big page
        if (viewport.width > 1500) {
            renderOnePage();
            position = 'right';
            fullScreenRotate(ctx, canvas, -90 * Math.PI / 180, original_height);
        } else {
            ctx.scale(s, s);
            if (num + 1 <= pdfDoc.numPages) {
                pdfDoc.getPage(num + 1).then(page => {
                    var viewport = page.getViewport({ scale });
                    if (viewport.width > 1500) {
                        renderOnePage();
                        position = 'left';
                        fullScreenRotate(ctx_left, canvas_left, -90 * Math.PI / 180, target_height);
                    } else {
                        a.hasBigPage = false;
                        hasBigPage = false;
                        //console.log('!');
                    }
                });
            }
        }

        page.render(renderCtx).promise.then(() => {});
        // Output current page
        document.querySelector('#page-num').textContent = pageNum;
        return;

    });

    // Get another page
    if (num + 1 <= pdfDoc.numPages) {
        pdfDoc.getPage(num + 1).then(page => {
            // Set scale
            var viewport = page.getViewport({ scale });
            canvas_left.height = viewport.height;
            canvas_left.width = viewport.width;

            canvas_left.height = target_height;
            var s = canvas_left.height / viewport.height;
            viewport = page.getViewport({ scale: s });
            canvas_left.width = (viewport.width * canvas_left.height) / viewport.height;

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

            canvas_right.height = target_height;
            var s = canvas_right.height / viewport.height;
            viewport = page.getViewport({ scale: s });
            canvas_right.width = (viewport.width * canvas_right.height) / viewport.height;

            const renderCtx_right = {
                canvasContext: ctx_right,
                viewport: viewport,
            };

            page.render(renderCtx_right).promise.then(() => {});
        });
    }
}

function Rotate(ctx, _canvas, angle, height) {
    var original_width = _canvas.width;
    var original_height = _canvas.height;
    var x = _canvas.width / 2;
    var y = _canvas.height / 2;
    _canvas.width = _canvas.height * y / x;
    x = _canvas.width / 2;
    y = _canvas.height / 2;
    ctx.translate(x, y);
    ctx.rotate(angle);
    var _scale = original_height / original_width;
    ctx.translate(-y, -x);
    ctx.scale(_scale, _scale);
    var s = _canvas.height / height;
    console.log(height);
    ctx.scale(s, s);
}

function fullScreenRotate(ctx, _canvas, angle, height) {
    var original_width = _canvas.width;
    var original_height = _canvas.height;
    var x = _canvas.width / 2;
    var y = _canvas.height / 2;
    _canvas.width = _canvas.height * y / x;
    x = _canvas.width / 2;
    y = _canvas.height / 2;
    ctx.translate(x, y);
    ctx.rotate(angle);
    var _scale = original_height / original_width;
    ctx.translate(-y, -x);
    ctx.scale(_scale, _scale);
    var s = _canvas.height / height;
    ctx.scale(s, s);
}

function fitWindowSize() {
    if (!isFullScreen) {
        var height = 640;
        var scale = height / render_area.height;
        render_area.height = height
        render_area.width *= scale;
        console.log(render_area.height);
    }
}

function renderOnePage() {
    a.hasBigPage = true;
    hasBigPage = true;
}

// Show Prev Page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    if (position == 'left') {
        if (hasBigPage == true) {
            pageNum++;
        }
    }
    pageNum -= 2;
    if (isFullScreen) {
        fullScreenRenderPage(pageNum);
    } else {
        renderPage(pageNum);
    }
};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    if (position == 'right') {
        if (hasBigPage == true) {
            pageNum--;
        }
    }
    pageNum += 2;
    if (isFullScreen) {
        fullScreenRenderPage(pageNum);
    } else {
        renderPage(pageNum);
    }
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
        pageNum = 1;
        renderPage(pageNum);
        document.querySelector('#filename').textContent = file.name;
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
        fullScreenRenderPage(pageNum);
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
        if (evt.keyCode == 67) {
            console.log('!');
            render_area.height *= 1.5;
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


var bigpage = a.hasBigPage;
Object.defineProperty(a, 'hasBigPage', {
    set: function(value) {
        hasBigPage = value;
        if (bigpage != hasBigPage) {
            bigpage = hasBigPage;
            //console.log('value changed!! set: ' + hasBigPage);
            if (hasBigPage == true) {
                //console.log(position);
                var threshold;
                if (!isFullScreen) {
                    threshold = normalThreshold;
                }
                if (isFullScreen) {
                    threshold = fullScreenThreshold;
                }
                if (canvas.width > threshold) {
                    //console.log('right');
                    canvas_left.style.display = 'none';
                } else {
                    //console.log('left');
                    canvas.style.display = 'none';
                }
            }
            if (hasBigPage == false) {
                if (position == 'right') {
                    canvas_left.style.display = 'block';
                    //console.log(position, ' after');
                }
                if (position == 'left') {
                    canvas.style.display = 'block';
                    //console.log(position, ' after');
                }
            }
        }
    }
})

var _position = p.position;
Object.defineProperty(p, 'position', {
    set: function(value) {
        position = value;
        if (_position != position) {
            _position = position;
            console.log('value changed!! set: ' + position);
        }
    }
})