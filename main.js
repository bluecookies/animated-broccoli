// to avoid cross origin taint
// run on http server 
// e.g.
// python -m SimpleHTTPServer

// E = "item/xhtml/p-002.xhtml" + "/" + 0
// NFBR.a0X.a3h = 4

$(document).ready(function() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	var charSum = 1937;
	
	var img = new Image();
	var path = "images";
	var maxImage = 1;
	var imageIndex = startIndex = 1;
	var saving = false;
	//img.crossOrigin = "Anonymous";
	img.addEventListener("load", function() {
			canvas.width = img.width - $("#widthClip").val();
			canvas.height = img.height;
			
			var pattern = charSum;
			if (imageIndex == startIndex) {
				pattern += 543;	//"cover"
			} else {
				var str = String(imageIndex).padStart(3, 0);
				for (var i = 0; i < str.length; i++) {
					pattern += str.charCodeAt(i);
				}
			}
			pattern = pattern % 4 + 1;
	
			drawShuffledImage(ctx, img, pattern);
			//ctx.getImageData(0, 0, canvas.width, canvas.height);
			if (saving === true) {
				canvas.toBlob(function(blob) {
					saveAs(blob, imageIndex + ".png");
					imageIndex++;
					if (imageIndex <= maxImage)
						img.src = getImagePath(path, imageIndex, startIndex);
					else
						saving = false;
				});
			}
	}, false);
	
	$("#save").on("click", function() {
		saving = true;
		maxImage = $("#maxImage").val();
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#next").on("click", function() {
		imageIndex++;
		$("#gotoPage").val(imageIndex - startIndex);
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#prev").on("click", function() {
		imageIndex--;
		$("#gotoPage").val(imageIndex - startIndex);
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#load").on("click", function() {
		imageIndex = startIndex = $("#startPage").val() - 1;
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#goto").on("click", function() {
		imageIndex = parseInt($("#gotoPage").val(), 10) + startIndex;
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#widthClip").on("change", function() {
		canvas.width = img.width - $("#widthClip").val(); //event.result?
		img.src = getImagePath(path, imageIndex, startIndex);
	});
	$("#path").on("change", function() {
		path = $("#path").val();
	});
});

function getImagePath(path, imgIndex, startIndex) {
	if (imgIndex > startIndex)
		return "./" + path + "/" + String(imgIndex).padStart(3, 0) + ".jpeg";
	else if (imgIndex == startIndex)
		return "./" + path + "/cover.jpeg";
}

function drawShuffledImage(ctx, img, pattern) {
	//ctx.drawImage(img, 0, 0);
	$.each(shuffleArray(img.width, img.height, 64, 64, pattern), function(index, imgBlock) {
		ctx.drawImage(
			img, 
			imgBlock.destX, imgBlock.destY, 	//sx, sy
			imgBlock.width, imgBlock.height, 	//swidth, sheight
			imgBlock.srcX, imgBlock.srcY, 		//x, y
			imgBlock.width, imgBlock.height) 	//width, height
	});
}


// Generate unshuffle array
// imgWidth, imgHeight, blockWidth, blockHeight, pattern
function shuffleArray(imgWidth, imgHeight, bW, bH, pattern) {
		var outputArray = [];

		var xBlocks = Math.floor(imgWidth / bW)
			, yBlocks = Math.floor(imgHeight / bH);
		var excessX = imgWidth % bW;
		var excessY = imgHeight % bH;
		var p, r;
		
		var g = xBlocks - 43 * pattern % xBlocks;
		if (g % xBlocks == 0)
			g = (xBlocks - 4) % xBlocks;
		if (g == 0)
			g = xBlocks - 1;
			
		var l = yBlocks - 47 * pattern % yBlocks;
		if (l % yBlocks == 0)
			l = (yBlocks - 4) % yBlocks
		if (l == 0)
			l = yBlocks - 1;
		
		// excess block
		if (excessX > 0 && excessY > 0) {
			var xPos = g * bW;
			var yPos = l * bH;
			outputArray.push({
				srcX: xPos, srcY: yPos,
				destX: xPos, destY: yPos,
				width: excessX,
				height: excessY
			});
		}
		// excess flat blocks
		if (excessY > 0) {
				for (var x = 0; x < xBlocks; x++) {
						p = calcXCoordinateXRest_(x, xBlocks, pattern);
						var k = calcYCoordinateXRest_(p, g, l, yBlocks, pattern);
						p = calcPositionWithRest_(p, g, excessX, bW);
						r = k * bH;
						k = calcPositionWithRest_(x, g, excessX, bW);
						var m = l * bH;
						outputArray.push({
							srcX: k, srcY: m,
							destX: p, destY: r,
							width: bW, height: excessY
						});
				}
		}
		// excess tall blocks
		if (excessX > 0) {
			for (var y = 0; y < yBlocks; y++) {
				var k = calcYCoordinateYRest_(y, yBlocks, pattern);
				var p = calcXCoordinateYRest_(k, g, l, xBlocks, pattern) * bW;
				var r = calcPositionWithRest_(k, l, excessY, bH);
				k = g * bW;
				var m = calcPositionWithRest_(y, l, excessY, bH);
				outputArray.push({
					srcX: k, srcY: m,
					destX: p, destY: r,
					width: excessX, height: bH
				});
			}
		}
		// normal blocks
		for (var x = 0; x < xBlocks; x++) {
			for (var y = 0; y < yBlocks; y++) {
				p = (x + 29 * pattern + 31 * y) % xBlocks;
				var k = (y + 37 * pattern + 41 * p) % yBlocks;
				r = p >= calcXCoordinateYRest_(k, g, l, xBlocks, pattern) ? excessX : 0;
				var m = k >= calcYCoordinateXRest_(p, g, l, yBlocks, pattern) ? excessY : 0;
				p = p * bW + r;
				r = k * bH + m;
				k = x * bW + (x >= g ? excessX : 0);
				m = y * bH + (y >= l ? excessY : 0);
				outputArray.push({
					srcX: k, srcY: m,
					destX: p, destY: r,
					width: bW, height: bH
				});
		}
		}
		return outputArray;
}
function calcPositionWithRest_(excessX, excessY, bW, bH) {
	return excessX * bH + (excessX >= excessY ? bW : 0)
}
function calcXCoordinateXRest_(excessX, excessY, bW) {
	return (excessX + 61 * bW) % excessY
}
function calcYCoordinateXRest_(excessX, excessY, bW, e, pattern) {
	var xBlocks = 1 === pattern % 2;
	(excessX < excessY ? xBlocks : !xBlocks) ? (e = bW,
	excessY = 0) : (e -= bW,
	excessY = bW);
	return (excessX + 53 * pattern + 59 * bW) % e + excessY
}
function calcXCoordinateYRest_(excessX, excessY, bW, e, pattern) {
	var xBlocks = 1 == pattern % 2;
	(excessX < bW ? xBlocks : !xBlocks) ? (e -= excessY,
	bW = excessY) : (e = excessY,
	bW = 0);
	return (excessX + 67 * pattern + excessY + 71) % e + bW
}
function calcYCoordinateYRest_(excessX, excessY, bW) {
	return (excessX + 73 * bW) % excessY
}

// Get pattern number and actual width/height
/* this.constructPages = function() {
            var e, c, d, h, g, l, k, m, p, r, t, q = [], u, w = 0, x, y, z = function(a, b) {
                var d = new NFBR.a6i.Page(null,-1,null);
                d.width = a;
                d.height = b;
                d.info = null;
                d.label = null;
                return d
            }, E;
            d = this.book.content[this.fontSize + "_" + this.fontFace];
            k = new NFBR.a6i.Spread(!0,null,null);
            k.pageIndex = w;
            this.pageDirection = "rtl" === d.configuration["page-progression-direction"] ? NFBR.a6i.PageDirection.RIGHT_TO_LEFT : NFBR.a6i.PageDirection.LEFT_TO_RIGHT;
            for (var a = 0; a < d.configuration.contents.length && 0 < y; a++) {
                l = d.configuration.contents[a];
                h = f(d, l["original-file-path"], l.file);
                g = d.files[h];
                x = g.Title ? g.Title : "";
                p = !1;
                e = g.FixedLayoutSpec.PageSide;
                this.book.contentType === NFBR.a6i.ContentType.OMF && e === NFBR.a6i.PageSide.UNSPECIFIED && (e = NFBR.a6i.PageSide.CENTER);
                if (this.canDoublePages)
                    if (this.landscape)
                        switch (g.FixedLayoutSpec.RenditionSpread) {
                        case NFBR.a6i.RenditionSpread.UNSPECIFIED:
                        case NFBR.a6i.RenditionSpread.LANDSCAPE:
                        case NFBR.a6i.RenditionSpread.BOTH:
                        case NFBR.a6i.RenditionSpread.AUTO:
                            e !== NFBR.a6i.PageSide.CENTER && (p = !0)
                        }
                    else
                        switch (g.FixedLayoutSpec.RenditionSpread) {
                        case NFBR.a6i.RenditionSpread.PORTRAIT:
                        case NFBR.a6i.RenditionSpread.BOTH:
                            e !== NFBR.a6i.PageSide.CENTER && (p = !0)
                        }
                else
                    p = !1;
                t = r = !1;
                if (g.FixedLayoutSpec.RenditionLayout === NFBR.a6i.RenditionLayout.PRE_PAGINATED && g.FixedLayoutSpec.RenditionSpread === NFBR.a6i.RenditionSpread.NONE && (this.landscape && (g.FixedLayoutSpec.AccessOrientation === NFBR.a6i.AccessOrientation.BOTH || g.FixedLayoutSpec.AccessOrientation === NFBR.a6i.AccessOrientation.LANDSCAPE) || !this.landscape && (g.FixedLayoutSpec.AccessOrientation === NFBR.a6i.AccessOrientation.BOTH || g.FixedLayoutSpec.AccessOrientation === NFBR.a6i.AccessOrientation.PORTRAIT)))
                    switch (g.FixedLayoutSpec.AccessScroll) {
                    case NFBR.a6i.AccessScroll.HORIZONTAL:
                        r = !0;
                        break;
                    case NFBR.a6i.AccessScroll.VERTICAL:
                        t = !0;
                        break;
                    case NFBR.a6i.AccessScroll.BOTH:
                        t = r = !0
                    }
                if (0 < g.FileLinkInfo.PageCount)
                    if (p)
                        g.FixedLayoutSpec.PageSide === NFBR.a6i.PageSide.LEFT ? k.left && (k.right || (k.right = z(k.left.width, k.left.height)),
                        q.push(k),
                        k = new NFBR.a6i.Spread(!0,null,null),
                        k.pageIndex = w) : g.FixedLayoutSpec.PageSide === NFBR.a6i.PageSide.RIGHT && k.right && (k.left || (k.left = z(k.right.width, k.right.height)),
                        q.push(k),
                        k = new NFBR.a6i.Spread(!0,null,null),
                        k.pageIndex = w);
                    else if (k.left || k.right)
                        k.isDoublePage && !k.right ? k.right = z(k.left.width, k.left.height) : k.left || (k.left = z(k.right.width, k.right.height)),
                        q.push(k),
                        k = new NFBR.a6i.Spread(!0,null,null),
                        k.pageIndex = w;
                for (e = 0; e < g.FileLinkInfo.PageCount; e++) {
                    u = g.FileLinkInfo.PageLinkInfoList[e].Page;
                    c = u.No;
                    m = l["original-file-path"] ? l["original-file-path"] + "#-acs-position-" + g.PageToBookmark[e][0] + "-" + g.PageToBookmark[e][1] : 4 < l.file.length && ".pdf" === l.file.substring(l.file.length - 4) ? l.file.substring(0, l.file.length - 4) + "#-acs-position-" + g.PageToBookmark[e][0] + "-" + g.PageToBookmark[e][1] : l.file + "#-acs-position-" + g.PageToBookmark[e][0] + "-" + g.PageToBookmark[e][1];
                    m = new NFBR.a6i.Page(d.configuration.contents[h].file + "/" + c + this.book.getFileExt(),w,m);
                    w += 1;
                    m.width = u.Size.Width;
                    m.height = u.Size.Height;
                    m.info = u;
                    m.label = x;
                    "number" === typeof u.DummyWidth && (m.dummyWidth = u.DummyWidth);
                    "number" === typeof u.DummyHeight && (m.dummyHeight = u.DummyHeight);
                    E = d.configuration.contents[h].file + "/" + c;
                    
                    var v = 0;
                    for (c = 0; c < E.length; c++)
                        v += E.charCodeAt(c);
                    m.pattern = v % NFBR.a0X.a3h + 1;
                    x && g.FixedLayoutSpec.RenditionLayout !== NFBR.a6i.RenditionLayout.PRE_PAGINATED && 0 !== u.ContentArea.Y ? (m.showPageNumber = !0, m.showRunningHead = !0) : (m.showPageNumber = !1, m.showRunningHead = !1);
                    p ? this.pageDirection === NFBR.a6i.PageDirection.RIGHT_TO_LEFT ? 0 === e && g.FixedLayoutSpec.PageSide === NFBR.a6i.PageSide.LEFT ? (m.headerAlignment = NFBR.a6i.Alignment.LEFT,
                    k.left = m,
                    0 < a && !k.right && (k.right = z(k.left.width, k.left.height)),
                    q.push(k),
                    k = new NFBR.a6i.Spread(!0,null,null),
                    k.pageIndex = w) : k.right ? (m.headerAlignment = NFBR.a6i.Alignment.LEFT,
                    k.left = m,
                    q.push(k),
                    k = new NFBR.a6i.Spread(!0,null,null),
                    k.pageIndex = w) : (m.headerAlignment = NFBR.a6i.Alignment.RIGHT,
                    m.showRunningHead = !1,
                    k.right = m,
                    k.isDoublePage = !0) : 0 === e && g.FixedLayoutSpec.PageSide === NFBR.a6i.PageSide.RIGHT ? (m.headerAlignment = NFBR.a6i.Alignment.RIGHT,
                    this.landscape && (m.showRunningHead = !1),
                    k.right = m,
                    0 < a && !k.left && (k.left = z(k.right.width, k.right.height)),
                    q.push(k),
                    k = new NFBR.a6i.Spread(!0,null,null),
                    k.pageIndex = w) : k.left ? (m.headerAlignment = NFBR.a6i.Alignment.RIGHT,
                    this.landscape && (m.showRunningHead = !1),
                    k.right = m,
                    q.push(k),
                    k = new NFBR.a6i.Spread(!0,null,null),
                    k.pageIndex = w) : (m.headerAlignment = NFBR.a6i.Alignment.LEFT,
                    this.landscape || (m.showRunningHead = !1),
                    k.left = m,
                    k.isDoublePage = !0) : (m.headerAlignment = this.landscape || this.pageDirection !== NFBR.a6i.PageDirection.LEFT_TO_RIGHT ? NFBR.a6i.Alignment.LEFT : NFBR.a6i.Alignment.RIGHT,
                    k.left = m,
                    k.right = null,
                    k.isDoublePage = !1,
                    k.scrollHorizontal = r,
                    k.scrollVertical = t,
                    q.push(k),
                    k = new NFBR.a6i.Spread(!0,null,null),
                    k.pageIndex = w)
                }
            }
            if (k.left || k.right)
                k.left ? k.right || (k.right = z(k.left.width, k.left.height)) : k.left = z(k.right.width, k.right.height),
                q.push(k);
            this.spreads = q;
            this.pageCount_ = w
        } 
*/
