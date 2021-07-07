

// Use different modulo because js leaves negative numbers negative
function myModulo(num, mod){
    return ((num%mod)+mod)%mod
}

function getAbsoluteDifferenceOfTwoDegreeValues(a, b) {
    var bigger = Math.max(a,b)
    var smaller = Math.min(a,b)
    var val1 = bigger - smaller
    var val2 = smaller + 360 - bigger
    return Math.min(val1, val2)
}

// Calculates the bigger interval between two degrees (there are two since a circle loops) and then
// returns the lower end
// Examples: (30,300) -> 30; (100,120) -> 120
function getLowerEndOfBiggerIntervalOfTwoDegreeValues(a,b) {
    var bigger = Math.max(a,b)
    var smaller = Math.min(a,b)
    if (bigger - smaller > smaller + 360 - bigger) return smaller
    else return bigger
}

// TODO: Divide by zero possible when lines intersect?
// Calculate intersection of two lines. Doesn't check whether lines actually intersect or 
// whether they intersect
function getIntersectionOfTwoLinesThatIntersect(line1Start, line1End, line2Start, line2End) {
    // use helper variables to make it more readable
    var a1 = line1Start.x
    var a2 = line1Start.y
    var b1 = line1End.x
    var b2 = line1End.y
    var c1 = line2Start.x
    var c2 = line2Start.y
    var d1 = line2End.x
    var d2 = line2End.y
    var q = ((c2-a2)*(b1-a1)-(c1-a1)*(b2-a2)) / ((d1-c1)*(b2-a2)-(d2-c2)*(b1-a1))
    var intersection = new Point(
        line2Start.x + q * (line2End.x - line2Start.x),
        line2Start.y + q * (line2End.y - line2Start.y),
    ) 
    return intersection
}

// Calculates the closest point on a line from a given position
function getClosestPointOfLine(lineStart, lineEnd, point) {
    var ab = lineEnd.sub(lineStart)
    var ap = point.sub(lineStart)
    var mul = (ab.x * ap.x + ab.y * ap.y) / (ab.x * ab.x + ab.y * ab.y)
    return lineStart.add(ab.mult(mul))
}

function getDistanceOfPointToLine(lineStart, lineEnd, point) {
    return getClosestPointOfLine(lineStart, lineEnd, point).distance(point)
}


class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    normalized() {
        var mag = Math.sqrt(this.x * this.x + this.y * this.y)
        return new Point(this.x / mag, this.y / mag)
    }
    add(p) {
        return new Point(this.x + p.x, this.y + p.y)
    }
    sub(p) {
        return new Point(this.x - p.x, this.y - p.y)
    }
    mult(v) {
        return new Point(this.x * v, this.y * v)
    }
    distance(p) {
        var xDiff = p.x - this.x
        var yDiff = p.y - this.y
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    }
};

function deg2rad(degrees) {
  return degrees * (Math.PI/180);
}

// Distort point by a certain direction. If restrictedByPoint is null, move in random direction, otherwise
// keep on line
function distortCorner(point, distance, restrictedByPoint = null) {
    console.log("distort by " + distance)
    if (restrictedByPoint != null) {
        console.log("along line")
        var moveDir = point.sub(restrictedByPoint).normalized().mult(distance)
        console.log(moveDir)
        if (Math.random() < 0.5) return point.add(moveDir)
        else return point.sub(moveDir)
    } else {
        console.log("circle")
        var diff1 = -distance + Math.random() * distance*2
        var diff2 = Math.random() < 0.5 ? - Math.sqrt(distance**2 - diff1**2) : Math.sqrt(distance**2 - diff1**2)
        console.log(diff1 + " " + diff2)
        if (Math.random() < 0.5) return point.add(new Point(diff1, diff2))
        else return point.add(new Point(diff2, diff1))
    }
}


// TODO: Should VP distance be roughly equal for each VP?
// TODO: Some versions of the initial Y are probably more likely to appear than others


/* Input: 
 *      centerCornerPos: Point
 *                       Position of the "center corner" of the initial Y. In the real world this would be the 
 *                       corner that is closest to the observer
 *      minVPDistance: float
 *                     Min distance of VP from the end of its respective line of the initial Y
 *      maxVPDistance: float
 *                     Max distance of VP from the end of its respective line of the initial Y
 * 
 * Output: List [a,b,c,d] where a and b are arrays of dimension 8 containing Points. Array a represents the   
 *         corners of the correct box. Array b represents the corners of the distorted  box. c is an Array
 *         of dimension 8 which represents how the according corners are allowed to be moved. Corners can 
 *         either be freely movable (represented by -1), movable by one axis (represented by the position of
 *         the corner that restricts it in this array, so a number in [0,7]), or not movable (represented by -2).
 *         d is an array of the three vanishing points.
 *         Example: ([p1_1,p2_1,p3_1,...],
 *                   [p1_2,p2_2,p3_2,...],
 *                   [-2,-2,-2,-2,-1,-2,3,-1])
 * This method generates a box (not a cube!) in random perspective. When the box is generated, it is
 * distortet in such a way that it can be corrected by moving specified corners freely or along a specific axis. There should always
 * only be one possible solution.
 * This is ensured by the generated restrictions: Nodes of the initial Y are never movable. One of the outer corners is also not movable (-> 2 vanishing points are set). Out 
 *      of the remaining 3 corners 2 are freely movable and one is restricted in such a way that it defines the remaining vanishing point
 */
function getBoxCorners(centerCornerPos, minLineLengthInitialY, maxLineLengthInitialY, minVPDistance, maxVPDistance, minDistortionDistance, maxDistortionDistance) {

    console.log("") // TODO: Remove
    console.log("")
    

    // Initialize arrays
    var correctCorners = [centerCornerPos,(0,0),(0,0),(0,0),(0,0),(0,0),(0,0),(0,0)]
    var distortedCorners = [centerCornerPos,(0,0),(0,0),(0,0),(0,0),(0,0),(0,0),(0,0)]
    var movementRestrictions = [-2,-2,-2,-2,-2,-2,-2,-2]

    // Set the lengths of the lines of the initial Y (must be in range (minLineLengthInitialY, maxLineLengthInitialY))
    var line1OfInitialYLength = minLineLengthInitialY + Math.random() * (maxLineLengthInitialY - minLineLengthInitialY)
    var line2OfInitialYLength = minLineLengthInitialY + Math.random() * (maxLineLengthInitialY - minLineLengthInitialY)
    var line3OfInitialYLength = minLineLengthInitialY + Math.random() * (maxLineLengthInitialY - minLineLengthInitialY)

    // Set the distances of the vanishing points to the center points (must be in range [line_OfInitialYLength, maxVPDistance])
    var VP1dist = line1OfInitialYLength + minVPDistance + Math.random() * (maxVPDistance - minVPDistance)
    var VP2dist = line2OfInitialYLength + minVPDistance + Math.random() * (maxVPDistance - minVPDistance)
    var VP3dist = line3OfInitialYLength + minVPDistance + Math.random() * (maxVPDistance - minVPDistance)



    // First line of initial Y is just a random direction
    var line1OfInitialYDegree = Math.random() * 360
    // Second line of initial Y is a random direction so that it is at least 90 degrees different from line 1
    var line2OfInitialYDegree = (line1OfInitialYDegree + 90 + Math.random() * 180) % 360
    // Third line of initial Y is a random direction to that it is at least 90 degrees different from line 1 and 2
        // Get the size of the smaller interval, then invert it (would be 360 - size), then subtract 180 (because of 90 degrees buffer to both lines)
    var line3Range = 180 - getAbsoluteDifferenceOfTwoDegreeValues(line1OfInitialYDegree, line2OfInitialYDegree)
    var startLine3 = getLowerEndOfBiggerIntervalOfTwoDegreeValues(line1OfInitialYDegree, line2OfInitialYDegree)
    var line3OfInitialYDegree = (startLine3 + 90 + Math.random() * line3Range) % 360
    

    // Calculate Positions of outer corners of the initial Y
    var corner1 = new Point(
        centerCornerPos.x + line1OfInitialYLength * Math.cos(deg2rad(line1OfInitialYDegree)),
        centerCornerPos.y + line1OfInitialYLength * Math.sin(deg2rad(line1OfInitialYDegree)),
    ) 
    var corner2 = new Point(
        centerCornerPos.x + line2OfInitialYLength * Math.cos(deg2rad(line2OfInitialYDegree)),
        centerCornerPos.y + line2OfInitialYLength * Math.sin(deg2rad(line2OfInitialYDegree)),
    ) 
    var corner3 = new Point(
        centerCornerPos.x + line3OfInitialYLength * Math.cos(deg2rad(line3OfInitialYDegree)),
        centerCornerPos.y + line3OfInitialYLength * Math.sin(deg2rad(line3OfInitialYDegree)),
    ) 

    // Add corners to both return arrays (positions of initial Y are always correct)
    correctCorners[1] = corner1
    correctCorners[2] = corner2
    correctCorners[3] = corner3

    distortedCorners[1] = corner1
    distortedCorners[2] = corner2
    distortedCorners[3] = corner3
    
    // Calculate vanishing points
    var vanishingPoint1 = centerCornerPos.add( ( corner1.sub(centerCornerPos) ).normalized().mult(VP1dist) )
    var vanishingPoint2 = centerCornerPos.add( ( corner2.sub(centerCornerPos) ).normalized().mult(VP2dist) )
    var vanishingPoint3 = centerCornerPos.add( ( corner3.sub(centerCornerPos) ).normalized().mult(VP3dist) )

    console.log(vanishingPoint1)
    console.log(vanishingPoint2)
    console.log(vanishingPoint3)
    console.log("")
    // Calculate remaining correct corners
        // outer corners
    correctCorners[4] = getIntersectionOfTwoLinesThatIntersect(corner1, vanishingPoint2, corner2, vanishingPoint1)
    correctCorners[5] = getIntersectionOfTwoLinesThatIntersect(corner1, vanishingPoint3, corner3, vanishingPoint1)
    correctCorners[6] = getIntersectionOfTwoLinesThatIntersect(corner2, vanishingPoint3, corner3, vanishingPoint2)
        // back corner
    correctCorners[7] = getIntersectionOfTwoLinesThatIntersect(correctCorners[4], vanishingPoint3, correctCorners[6], vanishingPoint1)


    // Distort corners
    // TODO: Wrong values

    // Set movement restrictions for corners and distort box
        // Always set 4 as the immovable corner. Since angles are random this should be the same as choosing a random 
        // value of [4,6]
    movementRestrictions[4] = -2
    movementRestrictions[5] = -1
    movementRestrictions[6] = -1
    movementRestrictions[7] = -1
    var restrictedCorner = 5 + Math.floor(Math.random() * 3);
    if (restrictedCorner == 5) {
        movementRestrictions[restrictedCorner] = 1
    } else if (restrictedCorner == 6) {
        movementRestrictions[restrictedCorner] = 2 
    } else {
        movementRestrictions[restrictedCorner] = 4
    }


    // Distort box
    distortedCorners[4] = correctCorners[4]
    var distortionDistance1 = minDistortionDistance + (Math.random() * (maxDistortionDistance-minDistortionDistance))
    var distortionDistance2 = minDistortionDistance + (Math.random() * (maxDistortionDistance-minDistortionDistance))
    var distortionDistance3 = minDistortionDistance + (Math.random() * (maxDistortionDistance-minDistortionDistance))
    distortedCorners[5] = distortCorner(correctCorners[5], distortionDistance1,  movementRestrictions[5] == -1 ? null : correctCorners[movementRestrictions[5]])
    distortedCorners[6] = distortCorner(correctCorners[6], distortionDistance2,  movementRestrictions[6] == -1 ? null : correctCorners[movementRestrictions[6]])
    distortedCorners[7] = distortCorner(correctCorners[7], distortionDistance3,  movementRestrictions[7] == -1 ? null : correctCorners[movementRestrictions[7]])


    console.log(correctCorners)
    console.log(distortedCorners)





    return [correctCorners, distortedCorners, movementRestrictions, [vanishingPoint1, vanishingPoint2, vanishingPoint3]]

}




