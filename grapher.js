
// Wait for the DOM to be ready using jQuery.
$(function(){
  
    // Get the 'canvas' DOM element based on its id using jQuery.
    var canvas = $('#myCanvas')[0],

        // Get the canvas context
        c = canvas.getContext('2d'),
        /* styling to be fixed later
        c.fillStyle = "#e5ff2",
        c.opacity = 0.9,
        c.fill(),
        */
        
        // 'n' is the number of discrete points used to approximate the 
        // continuous math curve defined by the math expression.
        // set equal to number of pixels of canvas
        n = 1000,
      
        // Define the math "window", which is the visible region in 
        // "math coordinates" that gets projected onto the Canvas.
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
       

        tree;

    // Sets the value of 'expr' and re-parses the expression into 'tree'.
    function setExpr(newExpr){
        expr = newExpr;
        tree = math.parse(expr, scope);
    }
     //generates axes
    function generatePlane() { //generates x and y axes
        c.beginPath();
        var currentPt;
        //horizontal(y) lines
        for (var i = 0; i <= (yMax - yMin) ; i++) {
            currentPt = ((yMin + yMax + i ) / (yMax - yMin)) * (canvas.height);
            c.moveTo(currentPt, 0);
            c.lineTo(currentPt, canvas.height);
        }
        //y axis
        c.moveTo(canvas.width / 2, 0); 
        c.lineTo(canvas.width / 2, canvas.height);
        //vertical(x) lines
        for (var i = 0; i <= (xMax - xMin) ; i++) {
            currentPt = (xMin + xMax + i) * canvas.width / (xMax - xMin);
            c.moveTo(0, currentPt);
            c.lineTo(canvas.width, currentPt);
        }
        //x axis
        c.moveTo(0, canvas.height / 2);
        c.lineTo(canvas.width, canvas.height / 2);


        c.stroke();
    }

    generatePlane();

    // Parameter yesNo is set to yes for f(x) and no for f'(x) and f''(x)
    // Plots the math expression curve on the canvas.
    function drawCurve(yesNo, paint, isSecond){
        // These variables are used inside the for loop.
        var i, 
        
            // These vary between xMin and xMax
            //                and yMin and yMax.
            xPixel, yPixel,
        
            // These vary between 0 and 1.
            percentX, percentY,
        
            // These are values in math coordinates.
            mathX, mathY;
    
        if (yesNo == true) {
            // Clear the canvas.
           c.clearRect(0, 0, canvas.width, canvas.height);
        }
        c.save();

        // Plot the math expression as a curve using the Canvas API:
    
        // This line of code begins the math curve path definition.
        c.beginPath();
        
        // 'n' is the number of points used to define the curve, which 
        // consists of (n - 1) straight line segments.
        for(i = 0; i < n; i++) {

            // 'i' varies between 0 and n - 1.
            // 'percentX' varies between 0 and 1.
            percentX = i / (n - 1);

            // 'mathX' varies between 'xMin' and 'xMax'.
            mathX = percentX * (xMax - xMin) + xMin;
            // mathY = f(mathX)

            //if function to graph is f(x)
            if (yesNo == true) {
                mathY = evaluateMathExpr(mathX);
            }
            //if function to graph is f'(x)
            else if (yesNo == false && isSecond == false) {
                mathY = calculateDerivative(mathX);
            }
            //if function to graph is f"(x)
            else if (yesNo == false && isSecond == true) {
                mathY = calculateSecondDerivative(mathX);
                //concavity(mathX, mathY);
            }
            
      
            // Project 'mathY' from the interval ['yMin', 'yMax']
            // to the interval [0, 1].
            percentY = (mathY - yMin) / (yMax - yMin);
      
            // Flip Y to match canvas coordinates.
            percentY = 1 - percentY;
      
            // Project percentX and percentY to pixel coordinates.
            xPixel = percentX * canvas.width;
            yPixel = percentY * canvas.height;

            c.strokeStyle = paint;

            // The first time this line of code is run, it defines the first point
            // in the path, acting exactly like 'c.moveTo(xPixel, yPixel);'
            // Subsequently, this line of code adds a line segment to the curve path
            // between the previous and current points.
            c.lineTo(xPixel, yPixel);
        }
        // This line of code renders the curve path defined by the 'c.lineTo'
        c.stroke();
        c.restore();
    }

    // Evaluates the current math expression 
    // Returns a Y coordinate
    function evaluateMathExpr(mathX){
       
        // Set values on the scope visible inside the math expression.
        scope.x = mathX;

        // Evaluate the previously parsed math expression and return it
        return tree.eval();
    }
    //takes approximate derivative at x with alternate form of difference quotient f(x+h)-f(x-h)/2h ~= f'(x) 
    function calculateDerivative(x) {
        //operates on assumption that f(x) = expr
        var h = 0.00001;
        var derivative = (evaluateMathExpr(x + h) - evaluateMathExpr(x - h)) / (2 * h); //applied difference quotient
        var result = Math.round(derivative * 100000) / 100000; //rounds answer to nearest 6th digit
        //console.log(result); //displays approximate derivative in console //To be removed soon
        return result;
    }

    function calculateSecondDerivative(x) {
        //operates on assumption that f(x) = expr
        //differentiates first derivative
        var h = 0.001;
        //var secondDerivative = calculateDerivative(x + h);
        var secondDerivative = (calculateDerivative(x + h) - calculateDerivative(x - h)) / (2 * h); //applied difference quotient
        var result = Math.round(secondDerivative * 10000) / 10000; //rounds answer to 4th digit
        //console.log(result); //displays approximate derivative in console //To be removed soon
        return result;
    }
   

    function extrema() {
        for (var i = xMin; i < xMax; i++) {
            var derivative = calculateDerivative(i);
            if (Math.abs(derivative) < 0.0005) { //accounts for floating point error
                var secondDeriv = calculateSecondDerivative(i);
                    if(secondDeriv > 0) { //if is rel min
                        //marker for rel min
                    }
                    else if(secondDeriv < 0) { //if is rel max
                        //marker for rel max
                    }
                
            }
        }
    }
    //evaluates second derivative at each x
    //if second deriv > 0, colors one color
    //if second deriv < 0, colors a different color
    //if second deriv is REALLY REALLY CLOSE to zero, should draw horizontal line or similar marker.
    //takes val of x coordinate and corresponding second derivative as parameter
    function concavity() { //assuming f(x) == expr
        for(var i = xMin; i < xMax; i++) {
            var secondDeriv = calculateSecondDerivative(i);
                if (Math.abs(secondDeriv) < 0.005) { //accounts for floating point arithmetic error, may need to be changed
                    //at inflection point, should draw line
                    c.moveTo(xVal, 0);
                    c.lineTo(xVal, canvas.height);

                }
           else if (secondDeriv < 0) {
            //if concave down
            //draws rectangle
            c.rect(xVal, 0, (xVal + 1), canvas.height);
            c.fillStyle = "yellow";
            c.fillRect();

        } 
       else if(secondDeriv > 0) {
            //if concave up
            c.rect(xVal, 0, (xVal + 1), canvas.height);
            c.fillStyle = "gray";
            c.fillRect();
        }
        }
            //should now draw a rectangle of height canvas.height and width canvas.width/n 
            //color depends on sign of second derivative
            //unless is zero, when horiz line should be drawn
    }

    //function to solve for when the denominator = 0;
    //assumes expression to work with is assigned to expr
    function calculateAsymptotes() {
        var denominator;
        for(var i = 0; i < expr.length; i++) {
            if (expr.charAt(i) == '/') {
                denominator = expr.substring(i + 1);
                break;
            }
        }
        setExpr(denominator);
        allZeroes();
        for (var j = 0; j < zeroes.length; j++) { //draws a horizontal line for every place where function is undefined
            var currentPt = (xMin + xMax + zeroes[j]) * canvas.width / (xMax - xMin);
            c.moveTo(0, currentPt);
            c.lineTo(canvas.width, currentPt);
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

    //calculates removable discontinuities by evaluating zeroes of numerator and denominator and checking for same values
    function removable(numerator) {
        var zero = calculateZero(0.5, numerator);
        console.log(zero);
    }

    var iterations = 0; //for the next recursive method
    //recursive function, applies newton's method taking value for previous guess
    //parameters: first guess, function, derivative of function
    //called by function allZeroes
    function calculateZero(prevGuess) {
        //console.log(expr);
        var nextGuess; //x1 in newton's
        var derivative = calculateDerivative(prevGuess);  
        var x;  //rounded x value
        var y;  //rounded y value

        nextGuess = prevGuess - evaluateMathExpr(prevGuess) / derivative; //using the formula for newton's method

        var fvalGuess = evaluateMathExpr(prevGuess);//evaluateMathExpr(nextGuess);
        //console.log(Math.round(nextGuess * 10000) / 10000);
        y = Math.round(fvalGuess * 100000) / 100000; //rounding y val to 6th place

        if (Math.abs(y) < 0.00000001) { //when y val is really, really close to 0
            x = Math.round(nextGuess * 100000) / 100000; //rounds to fourth decimal place. Good enough for my purposes.
            return x;
        }
        else if (iterations < 20000 && Math.abs(y) > 0.00000001) { //if function val is not close and 
            //if is less than 20000th iteration
            ++iterations;
            return (calculateZero(nextGuess)); //repeats newton's method until approximation is close enough
        }
        else { //if hit 20000 iterations but is still not near zero, return value //wait but what if it hasn't converged yet?
            x = Math.round(nextGuess * 10000) / 10000;
            return x; //returns solution or whatever value arrived at after set number of iterations.   
            ///NEED TO BE ABLE TO IDENTIFY WHEN DOES NOT CONVERGE
        }
    }

    var zeroes = [];

    //calculates all zeroes; parameter f is function input
    //calls function calculateZero for this
    //assigns zeroes to (global?) array zeroes
    function allZeroes() {
        //checks zeroes for each point on graph; needs to be optimized
        for (var i = xMin; i <= xMax ; i = i + 0.5) {
            zeroes.push(calculateZero(i)); //adds the root to array of zeroes
        }
        //next for loop clears out repeat zeroes
        //Unfortunately, doesn't work right now
        for (var j = 1; j <= zeroes.length ; j++) {
            if (Math.abs(zeroes[j] - zeroes[j - 1]) < 0.005) { //tries to account for floating point error
                zeroes.splice(j - 1, 1); //remove element at j-1 if is a repeat
            }
        }

    }

    //when button is clicked, graphs curves
    $('#btnGraph').click(function () {
        // displayDerivative();
        //call function to calculate derivatives

        setExpr($('#inputField').val());   //graphs main function
        drawCurve(true, '#ff0f00', false);

        generatePlane(); //draws plane again on top of function

        drawCurve(false, '#9900CC', false); //graphs first derivative

        //setExpr($('#derivResult').text()); //graphs second derivative
        drawCurve(false, '336600', true);
         
        if ($('#rational').checked) {
            calculateAsymptotes();
        }
        else if ($('#polynomial').checked || $('other').checked) {
            extrema();
            concavity();
        }

    });
});

