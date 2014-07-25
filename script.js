var MEME = MEME || {};

MEME.SVG = ( function ( $ ) {

  // Configure me if you want
  var watermark       = '',
      fontSizeSmall   = '14pt',
      fontSizeDefault = '18pt',
      fontSizeLarge   = '24pt',
      fontSizeHuge    = '36pt',
      fontFamilyDefault = 'freight-sans-pro',
      fontWeightDefault = 'bold';


  // Variables
  var canvas       = document.getElementById( 'canvas' ),
      canvasHeight = 378,
      canvasWidth  = 755,
      textOffset   = 200,
      deviceWidth  = window.innerWidth,
      context      = canvas.getContext( '2d' ),
      download     = document.getElementById( 'download' ),
      fontSize     = fontSizeDefault,
      fontFamily   = fontFamilyDefault,
      fontWeight   = fontWeightDefault,
      creditSize   = 0.6,
      img          = document.getElementById( 'image-storage' ),
      overlay      = true,
      overlayColor = 'blue',
      lineHeight   = 28,
      alignment    = 'left',
      x            = canvas.width / 2 - img.width / 2,
      y            = canvas.height / 2 - img.height / 2;


  /**
   * Sets up default canvas
   */
  var setupCanvas = function () {
    // Set up canvas defaults
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    // Set up context defaults
    context.textBaseline = 'top';
    context.font         = fontWeightDefault + ' ' + fontSizeDefault + ' ' + fontFamilyDefault;
    context.fillStyle    = 'white';
    // Add canvas
    context.drawImage( img, 0, 0 );
    // Set up rest of canvas
    addCanvas();
  }

  /**
   * Adds all the canvas elements
   */
  var addCanvas = function () {
    // Save current canvas values
    context.save();
    // Delete canvas because yolo
    context.clearRect( 0, 0, canvas.width, canvas.height );
    // Translate to center so transformations will apply around this point
    context.translate( canvas.width / 2, canvas.height / 2 );
    // Perform scale
    var val = document.getElementById('scale').value;
    context.scale( val, val );
    // Reverse the earlier translation
    context.translate( -canvas.width / 2, -canvas.height / 2 );
    // Redraw the new image
    context.drawImage( img, x, y );
    context.restore();
    // Add an overlay layer
    if ( overlay ) {
      addOverlay();
    } else {
      removeOverlay();
    }
    // Add the rest of the canvas pieces
    addHeadline();
    addCredit();
    addWatermark();
  }

  /**
   * Wraps text nicely within canvas
   * @param object context, the canvas rendering context
   * @param string text, the text to wrap
   * @param int x, where to put the text on the x axis
   * @param int y, where to put the text on the y axis
   * @param int maxWidth, how big should the text area be
   * @param int lineHeight, the line height of the text
   * Modified from http://bit.ly/1pHOuFO
   */
  var wrapText = function ( context, text, x, y, maxWidth, lineHeight ) {
    var words = text.split(' '),
        line  = '';
    for ( var n = 0; n < words.length; n++ ) {
      var testLine  = line + words[n] + ' ',
          metrics   = context.measureText( testLine ),
          testWidth = metrics.width;
      if ( testWidth > maxWidth && n > 0 ) {
        context.fillText( line, x, y );
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText( line, x, y );
  }

  var getLineBreaks = function ( text ) {
    var textArr = new Array();
    text = text.replace(/\n\r?/g, '<br/>');
    textArr = text.split("<br/>");
    return textArr;
  }

  /**
   * Handle overlay buttons
   */
  var handleOverlay = function () {
    // Get overlay color
    var that = $( this ).attr( 'class' );
    // Check if overlay is selected
    if ( that.indexOf( 'overlay-active' ) > -1 ) {
      $( this ).removeClass( 'overlay-active' );
      overlay = false;
    } else {
      // Get rid of all over active overlays
      $( '.overlay' ).removeClass( 'overlay-active' );
      overlay = true;
      $( this ).addClass( 'overlay-active' );
    }
    // Handle color variations
    overlayColor = $( this ).data( 'color' );
    // Redraw canvas
    addCanvas();
  }

  /**
   * Adds transparent overlay on top of image
   */
  var addOverlay = function () {
    // Cover everything
    context.rect( 0, 0, canvasWidth, canvasHeight );
    // Show user the color is active
    if ( overlayColor == 'black' ) {
      context.fillStyle = "rgba( 0, 0, 0, 0.6 )"; // Black
    } else if ( overlayColor == 'orange' ) {
      context.fillStyle = "rgba( 255, 140, 0, 0.6 );" // Orangish
    } else {
      context.fillStyle = "rgba( 52, 152, 219, 0.6 )"; // Vox blue
    }
    // Fill the canvas with the color yo
    context.fill();
  }

  /**
   * Get rid of overlays
   */
  var removeOverlay = function () {
    $( this ).removeClass( 'overlay-active' );
  }

  /**
   * Adds Vox svg watermark to each image
   */
  var addWatermark = function () {
    // Create a new image
    var img = new Image();
    // Place the image
    img.onload = function() {
      context.globalAlpha = 0.8;
      context.fillStyle = 'white';
      context.drawImage( img, 620, 290, 100, 50 );
      context.globalAlpha = 1; // reset transparency
    }
    // Load the watermark
    img.src = watermark;
  }


  /**
   * Adds headline to canvas
   */
  var addHeadline = function () {
    // Create our own canvas values
    var text = $( '#headline' ).val(),
        x = $( '#slider' ).val() * canvas.width,
        y = 45,
        maxWidth = canvas.width - textOffset - x;
    context.font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
    context.textAlign = alignment;
    context.fillStyle = 'white';
    // Adds text shadow
    if ( $( '#shadow' ).prop( 'checked' )  ) {
      context.shadowColor   = "#666";
      context.shadowOffsetX = -2;
      context.shadowOffsetY = -2;
      context.shadowBlur    = 10;
    }
    if ( alignment == 'right' ) {
      maxWidth = x - textOffset
    } else if ( alignment == 'center' ) {
      y = canvas.height - canvas.height / 1.5;
      maxWidth = canvas.width - canvas.width / 3;
      // Check x axis to see if it's spilling off the canvas
      if (x + maxWidth / 2 > canvas.width) {
        maxWidth = canvas.width - x 
      } else if (x - maxWidth / 2 < 0) {
        maxWidth = x 
      }
    };
    // Let's create that headline
    wrapText( context, text, x, y, maxWidth, lineHeight );
    // Reset the shadow
    context.shadowColor = "transparent";
  }

  /**
   * Adds source or photo credit to canvas
   */
  var addCredit = function () {
    // Get credit
    var text = $( '#credit' ).val(),
        x = $( '#creditslider' ).val() * canvas.width,
        y = 322;
    // Set our own canvas styles
    context.fillStyle = 'white';
    context.textAlign = 'left';
    creditFontSize = (parseInt(fontSize.substr(0,2)) * creditSize).toString() + 'pt'
    context.font = fontWeight + ' ' + creditFontSize + ' ' + fontFamily;
    // Create that credit
    context.fillText( text, x, y );
  }

  /**
   * Change font size based on data attribute of option elements
   */
  var handleFontSize = function () {
    var size = $( '#fontsize option:selected' ).val();
    switch( size ) {
      case 'smaller':
          fontSize = fontSizeSmall;
          break;
      case 'bigger':
          fontSize = fontSizeLarge;
          break;
      case 'huge':
          fontSize = fontSizeHuge;
          break;
      default:
          fontSize = fontSizeDefault;
    }
    fontSize = fontSize;
    lineHeight = $( '#fontsize option:selected' ).data( 'height' );
    addCanvas();
  }

  /**
   * Change credit size based on data attribute of option elements
   */
  var handleCreditSize = function () {
    var size = $( '#creditsize option:selected' ).val();
    switch( size ) {
      case 'smaller':
          creditSize = 0.4;
          break;
      case 'bigger':
          creditSize = 0.8;
          break;
      case 'huge':
          creditSize = 1.0;
          break;
      default:
          creditSize = 0.6;
    }
    creditSize = creditSize;
    addCanvas();
  }

  /**
   * Change font size based on data attribute of option elements
   */
  var handleFontFamily = function () {
    var family = $( this ).val();
    if(this.id == 'fontfamily_freeform') {
      if(family === '') {
        family = $('#fontfamily option:selected').val();
      } else {
        $('#fontfamily').val('');
      }
    } else {
      $('#fontfamily_freeform').val('');
    }
    fontFamily = family;
    addCanvas();
  }

  /**
   * Change font weight based on data attribute of checkbox elements
   */
  var handleFontWeight = function () {
    fontWeight = $( '#fontweight' ).prop( 'checked' ) ? 'bold' : 'normal'
    addCanvas();
  }

  /**
   * Change headline alignment (left, right, center)
   */
  var handleAlignment = function () {
    alignment = $( '#alignment option:selected' ).val();
    addCanvas();
  }

  /**
   * Saves a canvas as png
   */
  var saveCanvas = function () {
    // Converts canvas to url
    var image  = canvas.toDataURL().replace( 'image/png', 'image/octet-stream' );
    // Enables download
    download.href = image;
  }

  /**
   * Stops default browser behaviors and actions
   * @param object mouseevent, the dropped file object
   * @uses stopPropagation
   * @uses preventDefault
   */
  var stopBrowserActions = function ( mouseevent ) {
    mouseevent.stopPropagation(); // Stops bubbling
    mouseevent.preventDefault();  // Stop clicks
  }

  /**
   *  Creates local copy of dropped file
   *  @param object mouseevent, the dropped file
   */
  var handleDragAndDrop = function ( mouseevent ) {
    stopBrowserActions( mouseevent );
    event.dataTransfer.dropEffect = 'copy';
  }

  /**
   * File event handler
   * @param object mouseevent, the dropped file
   * @return html
   */
  var handleFiles = function ( mouseevent ) {
    stopBrowserActions( mouseevent );
    // Add html to files div
    showFile( mouseevent.dataTransfer.files );
  }

  /**
   * Shows image as canvas
   * @param array file, the dropped file
   */
  var showFile = function ( file ) {
    // Create a file reader
    var reader = new FileReader();
    reader.onload = function( event ) {
      // Draw image into canvas
      img.onload = function() {
        // center image in canvas
        context.clearRect( 0, 0, canvas.width, canvas.height );
        document.getElementById( 'scale' ).value = 1;
        x = canvas.width / 2 - img.width / 2;
        y = canvas.height / 2 - img.height / 2;
        // draw image in canvas
        context.drawImage( img, x, y );
      }
      // Read the uploaded file as image
      img.src = reader.result;
    }
    // Read uploaded image
    reader.readAsDataURL( file[0] );
  }

  /**
   * Handle clicks and change events
   */
  var handleEvents = function () {
    var credit = document.getElementById( 'credit' );
    credit.addEventListener( 'keyup', addCanvas, false );
    credit.addEventListener( 'input', addCanvas, false );
    credit.addEventListener( 'paste', addCanvas, false );

    var headline = document.getElementById( 'headline' );
    headline.addEventListener( 'keyup', addCanvas, false );
    headline.addEventListener( 'input', addCanvas, false );
    headline.addEventListener( 'paste', addCanvas, false );

    var scale = document.getElementById('scale');
    scale.addEventListener( 'change', addCanvas, false );

    var slider = document.getElementById( 'slider' );
    slider.addEventListener( 'change', addCanvas, false );

    var creditSlider = document.getElementById( 'creditslider' );
    creditSlider.addEventListener( 'change', addCanvas, false );

    var shadow = document.getElementById( 'shadow' );
    shadow.addEventListener( 'change', addCanvas, false );

    download.addEventListener( 'click', saveCanvas, false );

    var dropzone = document.getElementById( 'dropzone' );
    dropzone.addEventListener( 'dragover', handleDragAndDrop, false );
    dropzone.addEventListener( 'drop', handleFiles, false );

    $( '.overlay' ).on( 'click', handleOverlay );
    $( '#fontsize' ).on( 'change', handleFontSize );
    $( '#fontweight' ).on( 'click', handleFontWeight );
    $( '#creditsize' ).on( 'change', handleCreditSize );
    $( '#fontfamily' ).on( 'change', handleFontFamily );
    $( '#fontfamily_freeform' ).on( 'change', { test: 'test' }, handleFontFamily );
    $( '#alignment' ).on( 'change', handleAlignment );
  }

  /**
   * Get this meme started
   */
  var init = function () {
    setupCanvas();
    handleEvents();
  }

  window.onload = function() {
    init();
  }

} )( jQuery );