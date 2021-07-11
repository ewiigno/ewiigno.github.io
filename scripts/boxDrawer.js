// TODO: Start at good coordinate

// Whether to draw the lines of the initial Y bold
var initialYLinesWidth = 4
// radius of circles when drawn
var circleRadius = 3
// radius around a corner that counts as a click on it
var cornerTouchRadius = 5
// Whether the mouse is currently down; used for click events
var mousedown = false
// The index of the corner that was clicked on. If click didn't hit corner this value must be null
var selectedCornerIndex = null

//var canvas = document.getElementById("myCanvas");
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; 



function drawLine(point1, point2, width=1, color="black") {
    ctx.beginPath();
    // initial Y
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.stroke();
}

function drawPoint(point1, color) {
    ctx.beginPath();
    ctx.arc(point1.x, point1.y, circleRadius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
    ctx.lineWidth = 0
    ctx.strokeStyle = color
    ctx.stroke()
}

function drawABox(cornerArray, cornerRestrictions, drawExtendedLines = false) {
    outlinesWidth = 2
    outlinesColor = "grey"
    
    // lines to outer corners 
    drawLine(cornerArray[1], cornerArray[4], outlinesWidth)
    drawLine(cornerArray[2], cornerArray[4], outlinesWidth)
    
    drawLine(cornerArray[1], cornerArray[5], outlinesWidth, outlinesColor)
    drawLine(cornerArray[3], cornerArray[5], outlinesWidth, outlinesColor)
    
    drawLine(cornerArray[2], cornerArray[6], outlinesWidth, outlinesColor)
    drawLine(cornerArray[3], cornerArray[6], outlinesWidth, outlinesColor)

    // lines to back corner
    drawLine(cornerArray[4], cornerArray[7], outlinesWidth, outlinesColor)
    drawLine(cornerArray[5], cornerArray[7], outlinesWidth, outlinesColor)
    drawLine(cornerArray[6], cornerArray[7], outlinesWidth, outlinesColor)

    // initial Y
    drawLine(cornerArray[0], cornerArray[1], initialYLinesWidth)
    drawLine(cornerArray[0], cornerArray[2], initialYLinesWidth)
    drawLine(cornerArray[0], cornerArray[3], initialYLinesWidth)

    // draw extended lines if requested
    if (drawExtendedLines) {
        fixedLinesWitdh = 2
        drawLine(cornerArray[0], cornerArray[1].add(cornerArray[1].sub(cornerArray[0]).normalized().mult(2000)), fixedLinesWitdh, "red")
        drawLine(cornerArray[0], cornerArray[2].add(cornerArray[2].sub(cornerArray[0]).normalized().mult(2000)), fixedLinesWitdh, "green")
        drawLine(cornerArray[0], cornerArray[3].add(cornerArray[3].sub(cornerArray[0]).normalized().mult(2000)), fixedLinesWitdh, "blue")

        // lines to outer corners 
        drawLine(cornerArray[1], cornerArray[4].add(cornerArray[4].sub(cornerArray[1]).normalized().mult(2000)), fixedLinesWitdh, "green")
        drawLine(cornerArray[2], cornerArray[4].add(cornerArray[4].sub(cornerArray[2]).normalized().mult(2000)), fixedLinesWitdh, "red")
        
        drawLine(cornerArray[1], cornerArray[5].add(cornerArray[5].sub(cornerArray[1]).normalized().mult(2000)), 1, "blue")
        drawLine(cornerArray[3], cornerArray[5].add(cornerArray[5].sub(cornerArray[3]).normalized().mult(2000)), 1, "red")
        
        drawLine(cornerArray[2], cornerArray[6].add(cornerArray[6].sub(cornerArray[2]).normalized().mult(2000)), 1, "blue")
        drawLine(cornerArray[3], cornerArray[6].add(cornerArray[6].sub(cornerArray[3]).normalized().mult(2000)), 1, "green")
        
        // lines to back corner
        drawLine(cornerArray[4], cornerArray[7].add(cornerArray[7].sub(cornerArray[4]).normalized().mult(2000)), 1, "blue")
        drawLine(cornerArray[5], cornerArray[7].add(cornerArray[7].sub(cornerArray[5]).normalized().mult(2000)), 1, "green")
        drawLine(cornerArray[6], cornerArray[7].add(cornerArray[7].sub(cornerArray[6]).normalized().mult(2000)), 1, "red")
    }

    // draw points 
    for (i = 0; i < cornerArray.length; i++) {
        var color = "#000000"
        if (cornerRestrictions[i] == -1) color = "#ff6500"
        else if (cornerRestrictions[i] >= 0) color = "#a64200"
        drawPoint(cornerArray[i], color)
    }



}



function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}


function getClickedCornerIndex(pointClicked, corners, movementRestrictions) {
    // Loop over all corners. Returns the first corner that is close enough and that is movable
    // -> If there are multiple corners on top of each other only one will be clickable
    // -> TODO: Don't allow corners to overlap OR add a reset button (actually, it shouldn't be necessary)
    for (let i = 0; i < corners.length; i++) {
        if (pointClicked.distance(corners[i]) < cornerTouchRadius) {
            // Only return if corner is movable
            if (movementRestrictions[i] > -2) return i
        }
    }
    return null
}







