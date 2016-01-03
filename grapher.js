
// Wait for the DOM to be ready using jQuery.
$(function () {

    // Get the 'canvas' DOM element based on its id using jQuery.
    var canvas = $('#myCanvas')[0],

        // Get the canvas context
        c = canvas.getContext('2d'),
        /* styling to be fixed later
        c.fillStyle = "#e5ff2",
        c.opacity = 0.9,
        c.fill(),
        */
        // n is number of line segments to be graphed
        // change based on function being graphed
        n,

        // Define the user's viewing window, to use when graphing
        //Add functionality to change this later
        xMin = -20,
        xMax = 20,
        yMin = -20,
        yMax = 20,

        // Initialize the Math.js library
        math = mathjs(),

        // 'expr' will contain the math expression as a string.
        expr = '',

        // 'scope' defines the variables available inside the math expression.
        scope = {
            x: 0
        },

        //expression as a tree
        tree;

    // Sets the value of 'expr' and re-parses the expression into 'tree'.
    function setExpr(newExpr) {
        expr = newExpr;
        tree = math.parse(expr, scope);
    }
    //generates axes
    function generatePlane() { //generates x and y axes
        c.beginPath();
        c.strokeStyle = "rgba(0,0,255,0.3)";
        var currentPt;
        //horizontal(y) lines
        for (var i = 0; i <= (yMax - yMin) ; i++) {
            currentPt = ((yMin + yMax + i) / (yMax - yMin)) * (canvas.height);
            c.moveTo(currentPt, 0);
            c.lineTo(currentPt, canvas.height);
        }

        //vertical(x) lines
        for (var i = 0; i <= (xMax - xMin) ; i++) {
            currentPt = (xMin + xMax + i) * canvas.width / (xMax - xMin);
            c.moveTo(0, currentPt);
            c.lineTo(canvas.width, currentPt);
        }
        c.stroke();
        c.beginPath();
        //y axis
        c.strokeStyle = "#000";
        c.moveTo(canvas.width / 2, 0);
        c.lineTo(canvas.width / 2, canvas.height);

        //x axis

        c.moveTo(0, canvas.height / 2);
        c.lineTo(canvas.width, canvas.height / 2);
        c.stroke();


    }

    generatePlane();


    // Plots the math expression curve on the canvas.
    function drawCurve(color, current) {
        // These variables are used inside the for loop.
        var i,

            // These vary between xMin and xMax
            //                and yMin and yMax.
            xPixel, yPixel,

            // These vary between 0 and 1.
            percentX, percentY,

            // These are values in math coordinates.
            mathX, mathY;

        if (current == 1) {
            // Clear the canvas.
            c.clearRect(0, 0, canvas.width, canvas.height);
        }
        c.save();

        // Plot the math expression as a curve using the Canvas API:

        // This line of code begins the math curve path definition.
        c.beginPath();

        // 'n' is the number of points used to define the curve, which 
        // consists of (n - 1) straight line segments.
        for (i = 0; i < n; i++) {

            // 'i' varies between 0 and n - 1.
            // 'percentX' varies between 0 and 1.
            percentX = i / (n - 1);

            // 'mathX' varies between 'xMin' and 'xMax'.
            mathX = percentX * (xMax - xMin) + xMin;
            // mathY = f(mathX)

            //if function to graph is f(x)
            if (current == 1) {
                mathY = evalExpr(mathX);
            }
                //if function to graph is f'(x)
            else if (current == 2) {
                mathY = calculateDerivative(mathX);
            }
                //if function to graph is f"(x)
            else if (current == 3) {
                mathY = calculateSecondDerivative(mathX);
            }


            // Maps to canvas coordinates
            percentY = (mathY - yMin) / (yMax - yMin);

            // Flip Y to match canvas coordinates.
            percentY = 1 - percentY;

            // Project percentX and percentY to pixel coordinates.
            xPixel = percentX * canvas.width;
            yPixel = percentY * canvas.height;

            c.strokeStyle = color;

            // The first time this line of code is run, it defines the first point
            // in the path, acting exactly like 'c.moveTo(xPixel, yPixel);'
            // Subsequently, this line of code adds a line segment to the curve path
            // between the previous and current points.
            c.lineTo(xPixel, yPixel);

            
            if (current == 1) {
                console.log("x: "+xPixel, "y: "+yPixel);
            }

        }
        // This line of code renders the curve path defined by the 'c.lineTo'
        c.stroke();
        c.restore();
    }

    // Evaluates the current math expression 
    // Returns a Y coordinate
    function evalExpr(mathX) {

        // Set values on the scope visible inside the math expression.
        scope.x = mathX;

        // Evaluate the previously parsed math expression and return it
        return tree.eval();
    }

    //takes approximate derivative at x with alternate form of difference quotient f(x+h)-f(x-h)/2h ~= f'(x) 
    function calculateDerivative(x) {
        //operates on assumption that f(x) = expr
        var h = 0.00001;
        var derivative = (evalExpr(x + h) - evalExpr(x - h)) / (2 * h); //applied difference quotient
        var result = Math.round(derivative * 1000000) / 1000000; //rounds answer
        //console.log(result); //displays approximate derivative in console //To be removed soon
        return result;
    }

    function calculateSecondDerivative(x) {
        //operates on assumption that f(x) = expr
        //takes derivative of the first derivative
        var h = 0.0001;
        //var secondDerivative = calculateDerivative(x + h);
        var secondDerivative = (calculateDerivative(x + h) - calculateDerivative(x - h)) / (2 * h); //applied difference quotient
        var result = Math.round(secondDerivative * 10000000) / 10000000; //rounds answer
        //console.log(result); //displays approximate derivative in console
        return result;
    }


    function extrema() {
        var x, y, xVal, yVal, radius;
        radius = 10;
        var previous = calculateDerivative(xMin - 0.01);
        for (var i = xMin; i < xMax; i = i + 0.05) { //change increment value
            var derivative = calculateDerivative(i);
            if ((derivative < 0 && previous > 0) || (derivative > 0 && previous < 0) || derivative == 0) {
                var secondDeriv = calculateSecondDerivative(i);
                if (secondDeriv > 0) { //if is rel min
                    x = Math.round(i * 10) / 10;
                    y = evalExpr(x);
                    xVal = (-xMin + x) * canvas.width / (xMax - xMin); //mapped x
                    yVal = (-yMin + y) * canvas.height / (yMax - yMin); //mapped y
                    yVal = 600 - yVal; //flips it to match canvas coordinates
                    //draw circle around this point
                    c.beginPath();
                    c.arc(xVal, yVal, radius, 0, 2 * Math.PI, false); //draws circle of radius centered at (xVal, yVal)
                    //console.log("extrema: rgba(" + $('#hdn5').val() + ",0.3)");
                    c.fillStyle = "rgba(" + $('#hdn5').val() + ",0.5)";
                    c.fill();
                }
                else if (secondDeriv < 0) { //if is rel max
                    x = Math.round(i * 10) / 10;
                    y = evalExpr(x);
                    xVal = (-xMin + x) * canvas.width / (xMax - xMin); //mapped x
                    yVal = (-yMin + y) * canvas.height / (yMax - yMin); //mapped y
                    yVal = 600 - yVal; //flips it to match canvas coordinates

                    //console.log('x: ' + xVal + ' y = ' + yVal);
                    //draw circle around this point
                    c.beginPath();
                    c.arc(xVal, yVal, radius, 0, 2 * Math.PI, false); //draws circle of radius centered at (xVal, yVal)
                    //console.log("elseif extrema: rgba(" + $('#hdn5').val() + ",0.3)");
                    c.fillStyle = "rgba(" + $('#hdn5').val() + ",0.5)";
                    c.fill();
                }
            }
            var previous = derivative;

        }
    }

    //evaluates second derivative at each x
    //if second deriv > 0, colors one color
    //if second deriv < 0, colors a different color
    //if second deriv has just changed from negative to positive, marks it as inflection point
    //takes val of x coordinate and corresponding second derivative as parameter
    function concavity() { //assuming f(x) == expr
        //console.log("Hi");
        var xVal;
        var width = (0.05) * canvas.width / (xMax - xMin);
        var previous = calculateSecondDerivative(xMin - 0.01);
        for (var i = xMin; i < xMax; i += 0.05) { //every 0.05 
            xVal = (-xMin + i) * canvas.width / (xMax - xMin); //mapped x (shifts over + multiplies w/ proportions)
            var secondDeriv = calculateSecondDerivative(i); //secondDerivative at x=i

            if ((secondDeriv < 0 && previous < 0) || (secondDeriv > 0 && previous > 0)) {
                if (secondDeriv < 0) {
                    //if concave down
                    //draws rectangle of width 1 and canvas height
                    c.fillStyle = "rgba(" + $('#hdn7').val() + ",0.3)";
                    c.fillRect(xVal, 0, width, canvas.height);
                }


                else if (secondDeriv > 0) {
                    //if concave up
                    //draws rectangle of width 1 and canvas height                   
                    c.fillStyle = "rgba(" + $('#hdn6').val() + ",0.3)";
                    c.fillRect(xVal, 0, width, canvas.height);
                }
            }
                //if different signs
            else if ((secondDeriv < 0 && previous > 0) || (secondDeriv > 0 && previous < 0) || secondDeriv == 0) {
                //at inflection point, should draw circle
                var yVal = (-(evalExpr(i) - yMax) * canvas.height) / (yMax - yMin);
                c.beginPath();
                c.arc(xVal, yVal, 5, 0, 2 * Math.PI, false); //draws circle of radius centered at (xVal, yVal)
                c.fillStyle = "rgba(" + $('#hdn4').val() + ",0.5)";
                c.fill();
            }
            var previous = secondDeriv;

        }
    }

    //var numerator;
    //function to solve for when the denominator = 0;
    //assumes expression to work with is assigned to expr, sets expr == denominator of function
    function calculateAsymptotes() {
        var denominator;
        var original = expr;
        for (var i = 0; i < expr.length; i++) {
            if (expr.charAt(i) == '/') {
                var numerator = expr.substring(0, i - 1);
                denominator = expr.substring(i + 1);
                break;
            }
        }
        setExpr(denominator);
        calculateZero(-20, 0.5, 40);
        setExpr(original);
        for (var j = 0; j < zeroes.length; j++) { //draws a vertical line for every place where function is undefined
            //if is removable discontinuity
            if (removable(zeroes[j])) {
                var currentPt = (-xMin + zeroes[j]) * canvas.width / (xMax - xMin); //find x coordinate
                var currentY = ((yMax - evalExpr(zeroes[j] + 0.00000001)) * canvas.height) / (yMax - yMin); //find y coordinate
                console.log(zeroes[j], evalExpr(zeroes[j] + 0.000001), currentPt, currentY);
                c.beginPath();
                c.arc(currentPt, currentY, 3, 0, 2 * Math.PI, false);
                c.stroke();

            } else {
                var currentPt = (xMax + zeroes[j]) * canvas.width / (xMax - xMin); //find xVal
                c.beginPath();
                c.moveTo(currentPt, 0);
                c.lineTo(currentPt, canvas.height);
                c.stroke();
            }
        }
    }

    //precalculates symbolic derivatives and displays them in divs
    //to be used later, not currently called
    function displayDerivative() {

        var input = $('#inputField').val(); //input from the inputfield

        var firstDeriv = nerdamer('diff(' + input + ',x)').evaluate();// nerdamer(derivative of input with respect to x);
        //evaluates first derivative result, sets it to div
        var result = firstDeriv.evaluate();
        $('#derivResult').text(result.text());
        // var f = result.buildFunction();

        //eval second derivative and set it to div by differentiating first derivative
        var secondDeriv = nerdamer('diff(' + firstDeriv + ',x)').evaluate();
        var result2 = secondDeriv.evaluate();
        $('#deriv2Result').text(result2.text());
        // var g = result2.buildFunction();
    }

    //calculates if discontinuity at xVal is removable or not, returns boolean
    function removable(xVal) {
        var diff1 = Math.abs(evalExpr(xVal - 0.1) - evalExpr(xVal - 0.01));
        var diff2 = Math.abs(evalExpr(xVal - 0.01) - evalExpr(xVal - 0.001));
        var diff3 = Math.abs(evalExpr(xVal + 0.1) - evalExpr(xVal + 0.01));
        var diff4 = Math.abs(evalExpr(xVal + 0.01) - evalExpr(xVal + 0.001));
        if (diff1 > diff2 && diff3 > diff4) {
            return true;
        }
        else return false;


    }

    var iterations = 0; //for the function newtonZero
    //recursive function, applies newton's method taking value for previous guess
    //NO LONGER USED
    function newtonZero(prevGuess) {
        //console.log(expr);
        var nextGuess; //x1 in newton's
        var derivative = calculateDerivative(prevGuess);
        var x;  //rounded x value
        var y;  //rounded y value

        nextGuess = prevGuess - evalExpr(prevGuess) / derivative; //using the formula for newton's method

        var fvalGuess = evalExpr(prevGuess);//evalExpr(nextGuess);
        //console.log(Math.round(nextGuess * 10000) / 10000);
        y = Math.round(fvalGuess * 100000) / 100000; //rounding y val to 6th place

        if (Math.abs(y) < 0.00000001) { //when y val is really, really close to 0
            x = Math.round(nextGuess * 100000) / 100000; //rounds to fourth decimal place. Good enough for my purposes.
            return x;
        }
        else if (iterations < 20000 && Math.abs(y) > 0.00000001) { //if function val is not close and 
            //if is less than 20000th iteration
            ++iterations;
            return (newtonZero(nextGuess)); //repeats newton's method until approximation is close enough
        }
        else { //if hit 20000 iterations but is still not near zero, return value //wait but what if it hasn't converged yet?
            x = Math.round(nextGuess * 10000) / 10000;
            return x; //returns solution or whatever value arrived at after set number of iterations.   
        }
    }

    var zeroes = [];
    //a function to calculate zeroes by checking if sign has changed
    function calculateZero(prevGuess, step, max) {
        for (var i = step; i <= max; i += step) {
            var prevX = prevGuess + i - step;
            var nextX = prevGuess + i;
            //calculates previous y value
            var prevVal = evalExpr(prevX);
            //calculates next y value
            var nextVal = evalExpr(nextX);
            if (nextVal == 0) {
                zeroes.push(nextX);
            }
            else if (prevVal == 0) {
                //do nothing as sign can't have changed
            }
                //if same sign
            else if ((nextVal < 0 && prevVal < 0) || (nextVal > 0 && prevVal > 0)) {
                //do nothing
            }
                //if different signs
            else {
                //add to zeroes array and continue
                zeroes.push(prevGuess + i);
            }
        }

    }


    //calculates all zeroes and assigns to zeroes[];
    //NOT USED
    function allZeroes() {
        //obsolete way, using newton's method

        var nextZero;
        var current = 1;
        for (var i = xMin; i <= xMax ; i = i + 0.5) {
            nextZero = newtonZero(i);
            //if a previous zero has been calculated and the difference between them is large enough
            if (zeroes[current - 1] != null && Math.abs(zeroes[current - 1]) - Math.abs(nextZero) > 0.005) {
                console.log(Math.abs(zeroes[current - 1]) - Math.abs(nextZero));
                zeroes.push(nextZero); //adds the root to array of zeroes
                ++current;
            }
                //or if is first zero calculated and has a value
            else if (zeroes[current - 1] == null && !(nextZero.isNaN)) {
                zeroes.push(nextZero);
                ++current;

            }
            //current keeps track of which cell of array we're on
        }

        //method using calculateZero()

    }

    //when button is clicked, graphs curves
    $('#btnGraph').click(function () {
        // displayDerivative();
        //call function to calculate derivatives

        setExpr($('#inputField').val());   //graphs main function
        


        //setExpr($('#derivResult').text()); //graphs second derivative
        if ($('#rational').is(':checked')) {
            calculateAsymptotes(); //calculates asymptotes of rational function
            
            n = 1000;

            drawCurve('#' + $('#hdnFuncColor').val(), 1); //'#ff0f00', false);

            generatePlane(); //draws plane again on top of function

        }
        else if ($('#polynomial').is(':checked')) {
            n = 1000;
            drawCurve('#' + $('#hdnFuncColor').val(), 1); //'#ff0f00', false);

            generatePlane(); //draws plane again on top of function


            drawCurve('#' + $('#hdn2').val(), 2); //graphs first derivative
            drawCurve('#' + $('#hdn3').val(), 3); //graphs second derivative

            extrema(); //highlights extrema
            concavity(); //marks concavity + inflection points 
        }
        else if ($('#other').is(':checked')) {
            n = 500;
            drawCurve('#' + $('#hdnFuncColor').val(), 1); //'#ff0f00', false);

            generatePlane(); //draws plane again on top of function

            drawCurve('#' + $('#hdn2').val(), 2); //graphs first derivative
            drawCurve('#' + $('#hdn3').val(), 3); //graphs second derivative

            extrema(); //highlights extrema
            concavity(); //marks concavity + inflection points 
        }

    });

    /*$('#btnClear').click(function () {
        c.clearRect(0, 0, canvas.width, canvas.height);
        generatePlane();

        $('#btnGraph').click();

    });
    */
});