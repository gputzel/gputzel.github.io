/*
 * decode.js
 * Gregory G. Putzel
 * A Javascript implementation of the Markov Chain Monte Carlo approach
 * to solving cryptograms, as described in Persi Diaconis' article
 * "The Markov Chain Monte Carlo Revolution"
 */

//For the display of the alphabet, wrap the space
//character in single quotes
function wrapSpace(s){
    if (s === " "){
        return "'  '";
    }
    else {
        return s;
    }
}

//Wrapper for the canvas that draws the permutation
function PermutationCanvasState(canvas,alphabet){
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.alphabet = alphabet;

    this.lines = [];

    //Positions of letters of the left (ciphertext) and right(output) alphabets
    this.leftAlphaX = 10;
    this.rightAlphaX = this.width - 25;
    this.AlphaY = new Object();
    for(var i = 0; i < alphabet.length; i++){
       this.AlphaY[i] = 20+20*i; 
    }
    //Positions of left and right endpoints of lines
    this.leftLineX = 25;
    this.rightLineX = this.width - 32;
    this.LineY = new Object();
    for(var i = 0; i < alphabet.length; i++){
        this.LineY[i] = 16+20*i;
    }
}

//Clears the canvas
PermutationCanvasState.prototype.clear = function(){
    this.ctx.clearRect(0,0,this.width,this.height);
}

/*Draws the elements in the canvas showing the current
permutation: alphabets are lined up on the left and right
and lines connecting the letters represent the permutation
*/
PermutationCanvasState.prototype.draw = function(perm){
    var alphabet = this.alphabet;
    var ctx = this.ctx;
    //var perm = this.perm;

    this.clear();
    ctx.font = "14px Arial";
    //Draw alphabet on left and right side of canvas
    for (var i=0; i<alphabet.length; i++){
        ctx.fillText(wrapSpace(alphabet[i]),this.leftAlphaX,this.AlphaY[i]);
        ctx.fillText(wrapSpace(alphabet[i]),this.rightAlphaX,this.AlphaY[i]);
    }
    
    //Draw the lines
    ctx.strokeStyle="#FF0000";
    ctx.beginPath();
    for(var i=0; i < alphabet.length; i++){
        ctx.moveTo(this.leftLineX, this.LineY[i]);
        ctx.lineTo(this.rightLineX, this.LineY[perm[alphabet[i]]]);
    }
    ctx.stroke();
    ctx.closePath();
}

/*Set up the initial permutation, namely the identity permutation
 */
function initialPermutation(alphabet){
    var d = new Object();
    var alph = alphabet;
    //Initialize the dictionary with the identity mapping
    for (var i=0; i<alph.length; i++){
        d[alph[i]]=i;
    }
    return d;
}

/*Randomize the permutation
 * */
function randomizePermutation(alphabet){
    //Randomize the dictionary
    var alph = alphabet;
    var j = 0;
    var temp = 0;
    for (var i=1; i<alph.length; i++){
        //Swap element i randomly with some element j <= i
        j = Math.floor(Math.random()*(i+1));
        //d[alph[i]] = d[alph[j]]
        //d[alph[j]] = d[alph[i]]
        temp = perm[alph[i]];
        perm[alph[i]] = perm[alph[j]];
        perm[alph[j]] = temp;
    }
}

/*Decrypt the plaintext according to the input permutation
 *This uses an input permutation p rather than the current
 *permutation (a global variable) because this function
 *is used to consider Monte Carlo trial moves
 */
function decrypt(p){
    var ciphertext=document.getElementById("ciphertextArea").value;
    myFunc=function(c){
        return alphabet[p[c]];
    };
    var plainText = ciphertext.split('').map(myFunc).join("");
    return plainText;
    //document.getElementById("plaintextArea").value = plainText;
}

/*Actually, log-likelihood
*The likelihood is the product of transition matrix entries
*over all successive pairs of letters in the output
*/
function likelihood(text){
    var s=0.0;
    //output=document.getElementById("plaintextArea").value;
    for(var i = 0; i < text.length-1; i++){
        s += parseFloat(trans[text.substring(i,i+2)]);
    }
    return s;
}

/*Returns the current log-likelihood
 */
function currentLL(){
    return likelihood(decrypt(perm));
}

/*
 * Randomizes the current permutation, redraws in on the canvas,
 * and writes the new output text to the appropriate textarea
 */
function resetPermutation(){
    randomizePermutation(alphabet);
    pcState.draw(perm);
    document.getElementById("plaintextArea").value = decrypt(perm);    
}

/*
 * Redraws the current permutation in the canvas and
 * writes the current output text to the appropriate textarea
 */
function updatePermutation(){
    pcState.draw(perm);
    document.getElementById("plaintextArea").value = decrypt(perm);    
}

/*
 * Performs a single Monte Carlo trial move
 */
function trialMove(){
    output=document.getElementById("plaintextArea").value;
    initialLL = likelihood(output);
    var len = alphabet.length;
    var i = Math.floor(Math.random()*len);
    var j = i;
    while (i === j){
        j = Math.floor(Math.random()*len);
    }
    //Make the change to the permutation (we will undo it if
    //the move is rejected)
    var temp = perm[alphabet[i]];
    perm[alphabet[i]] = perm[alphabet[j]];
    perm[alphabet[j]] = temp;
    //Find the new likelihood
    var newOutput = decrypt(perm);
    newLL = likelihood(newOutput);
    //If the new LL is greater, then accept the move
    if (newLL > initialLL){
        return true;
    }
    var delta = newLL - initialLL;
    //Beta is often used to denote the inverse temperature
    //in statistical mechanics. Or rather 1/kT where k is
    //Boltzmann's constant
    var beta = 1.0/T;
    if (Math.random()<Math.pow(10.0,beta*delta)){
        //Accept the move
        return true;
    }
    else{
        //Undo the move to reject it
        temp = perm[alphabet[i]];
        perm[alphabet[i]] = perm[alphabet[j]];
        perm[alphabet[j]] = temp;
        return false;
    }
}

//A thousand MC trial moves. Currently not used
function thousandMoves(){
    for (var i=0;i<1000;i++){
        trialMove();
    }
    updatePermutation();
}

/*A single "step" of the program
 * performs 100 trial moves, updates the current permutation,
 * and keeps track of the log-likelihood (for the scrolling plot)
 */
function step(){
    for (var i=0;i<100;i++){
        trialMove();
    }
    updatePermutation();
    llList.push(currentLL());
    llList.shift();

    //D3 code to update the scrolling likelihood plot
    path
        .attr("d",line)
        .attr("transform",null)
        .transition()
            .duration(50)
            .ease("linear")
            .attr("transform", "translate(" + x(-1) + ",0)");
}

//Go button
function go(){
    document.getElementById("goButton").innerHTML="Stop";
    document.getElementById("goButton").onclick=stop;
    plotTimer = setInterval(step,50);//This is what actually makes the process run in a loop
}

//Stop button
function stop(){
    document.getElementById("goButton").innerHTML="Go!";
    document.getElementById("goButton").onclick=go;
    clearInterval(plotTimer);//Stop running the loop
}

/*Initialize the list of log-likelihood data for the
 * scrolling plot. Initially, it just contains the initial
 * value, repeated over and over*/
function initListData(){
    var ll = currentLL();
    for (var i=0; i<llListLength; i++){
        llList.push(ll);
    }
}

/*Filters keystrokes for editing the ciphertext textarea
 */
function filterKeycode(keyCode){
   var c = String.fromCharCode(keyCode);
   if (c.match(/[a-z]/i)){
        return c.toUpperCase();
   }
   if (c.match(/[A-Z]/i)){
        return c;
   }
   if (c === " "){
       return c;
   }
   return "";
}

//Global variables
var pcState;//The state of the canvas wrapper for drawing permutations
var perm;//The current permutation - a hash from letters to numbers
var alphabet;
var plotTimer;
var llListLength = 100;//Number of data points in the scrolling log-likelihood plot
var llList=[];//The data in the log-likelihood plot
var T = 3.0;//The temperature

var svg;//Graphics for the D3 log-likelihood scrolling plot
var path;
var line;
var x,y;

//Start here
function init(){
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split("");

    //In the future, will add support for alphabets with or without space
    /*document.getElementById("targetAlphabet").disabled=true;
    switch(document.getElementById("targetAlphabet").value){
        case "alphabetWithSpace":
            alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split("");
            break;
        case "alphabet":
            alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            break;
    }*/

    pcState = new PermutationCanvasState(document.getElementById('permutationCanvas'),alphabet);
    perm = initialPermutation(alphabet);
    resetPermutation();

    initListData();
    
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 250 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    //Filter keystrokes going to the ciphertext textarea
    //This way, only alphabetic characters or spaces are added,
    //and everything is in uppercase
    $('#ciphertextArea').keypress(function (e) {
        var myValue = filterKeycode(e.keyCode);
        var startPos = this.selectionStart;
        var endPos = this.selectionEnd;
        var scrollTop = this.scrollTop;
        this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos,this.value.length);
        this.focus();
        this.selectionStart = startPos + myValue.length;
        this.selectionEnd = startPos + myValue.length;
        this.scrollTop = scrollTop;

        e.preventDefault();
    });

    //D3 code for the scrolling log-likelihood plot
    x = d3.scale.linear()
        .domain([0,llListLength-1])
        .range([0,width]);
    y = d3.scale.linear()
        .domain([-1600,0])
        .range([height,0]);
    line = d3.svg.line()
        .x(function(d,i) { return x(i);})
        .y(function(d,i) { return y(d);});
    svg = d3.select("#likelihood").append("svg")
        .attr("width",width+margin.left + margin.right).attr("height",height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + 0 +"," + 0 + ")");
    svg.attr("aling","center");
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.svg.axis().scale(x).ticks(0).orient("bottom"));
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).ticks(0).orient("left"));
    path = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(llList)
        .attr("class", "line")
        .attr("d", line);
}

window.onload = init;
