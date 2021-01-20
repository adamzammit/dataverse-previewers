var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.2,
    canvas = null,
    ctx = null;

$(document)
    .ready(
        function() {

    canvas = document.getElementById('the-canvas');
    ctx = canvas.getContext('2d');
document.getElementById('prev').addEventListener('click', onPrevPage);
document.getElementById('next').addEventListener('click', onNextPage);
startPreview(false);
});

function translateBaseHtmlPage() {
      //PDF Previewer has prev, next, and Page text on it along with the previewer title
      var pdfPreviewText = $.i18n( "pdfPreviewText" ); 
      $( '.pdfPreviewText' ).text( pdfPreviewText );
      var prev = $.i18n( "prev" ); 
      $( '#prev' ).text( prev );
      var next = $.i18n( "next" ); 
      $( '#next' ).text( next );
      var pageText = $.i18n( "pageText" ); 
      $( '.pageText' ).text( pageText );
}

function writeContent(fileUrl, file, title, authors) {
addStandardPreviewHeader(file, title, authors);


// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(fileUrl).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page_count').textContent = pdfDoc.numPages;

  // Initial/first page rendering
  renderPage(pageNum);
});
}

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      $('.lds-spinner').hide();
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  // Update page counters
  document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finished. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

