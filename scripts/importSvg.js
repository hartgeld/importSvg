
jQuery(document).ready(function(){

	var letters = [  "0020", "0021", "0022", "0023", "0024", "0025", "0026", "0027", "0028", "0029", "002a", "002b", "002c", "002d", "002e", "002f", "0030", "0031", "0032", "0033", "0034", "0035", "0036", "0037", "0038", "0039", "003a", "003b", "003c", "003d", "003e", "003f", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048", "0049", "004a", "004b", "004c", "004d", "004e", "004f", "0050", "0051", "0052", "0053", "0054", "0055", "0056", "0057", "0058", "0059", "005a", "005b", "005c", "005d", "005e", "005f", "007b", "007c", "007d", "007e", "2018" ]
	var myCounter = 0;
	

	for (var letterCount = 0; letterCount < letters.length; letterCount++) {

		var letterName = letters[letterCount];
		var myUrl = "/home/hartgeld/Websites/importSvg/source/" + "__U+" + letterName + ".svg";

		$.ajax({
	  	    type: "GET",
		    url: myUrl,
		    dataType: "xml",
		    success: function(svgXML) {

	      		var root = svgXML.getElementsByTagName('svg')[0].getAttribute('viewBox').split(' ');
	      		var width = root[2],
	      		    height = root[3];
		     	var paper = Raphael(0, 0, width, height);
	      		var shape = paper.importSVG(svgXML);

				var myLetterContainer = document.createElement('div');
				document.body.appendChild(myLetterContainer);
				myLetterContainer.id = letters[myCounter]; 

				var canvas;
				var mySlider = document.getElementById('mySlider');
				var scaleFactor = mySlider.value;
				console.log("init scaleFactor: " + scaleFactor);
				
				var isScaled = false;
				console.log(isScaled);
				
				mySlider.onchange = function(){
					scaleFactor = mySlider.value;
					console.log("new scaleFactor: " + scaleFactor);
					isScaled = true;
					canvasResize();
				};

				var myp5 = null;
				var myp5GlobalSketchVar = null;

				var canvasResize = function() {
				    if(myp5 && myp5GlobalSketchVar) {
				    	myp5.resizeCanvas(width*scaleFactor, height*scaleFactor);
				    	console.log('canvasresize: ' + width*scaleFactor + ', ' + height*scaleFactor );

				    	var myCanvasDiv = "#"+letterName;
				    	console.log(myCanvasDiv);
				    	$("#"+letterName).load(document.URL +  " #"+letterName);
				    	window.location.reload(false); 
				    }
				}

				var sketch = function( p ) {

					var physics;
					var center;
					var previousParticle;
					var lastParticle;

					var selected=null;
					var snapDist=20*20;

					var springsInLetter = [];

					var initLazyLoad;

					var myLetterUnicode;

					var mousePos;
					var mousePosDrag;
					var mouseAttractor;

					p.setup = function() {

						//canvas = p.createCanvas(width*scaleFactor, height*scaleFactor);
						myp5GlobalSketchVar = p.createCanvas(width*scaleFactor, height*scaleFactor);

						p.background(0,255,255);

						physics = new VerletPhysics2D();
						physics.setWorldBounds(new Rect(1,1,width-1,height-1));
						physics.addBehavior(new GravityBehavior(new Vec2D(0,0)));

						myLetterUnicode = letters[myCounter];

						console.log('loading letter ' + myLetterUnicode + ' |width: ' + width*scaleFactor + ' |height: ' + height*scaleFactor);

						p.buildLetter();						

						//remove all svg from dom 
						var element = document.getElementsByTagName("svg");
						for (index = element.length - 1; index >= 0; index--) {
						    element[index].parentNode.removeChild(element[index]);
						}

						p.lazyload();

						mousePos = new Vec2D(p.mouseX, p.mouseY);
						mouseAttractor = new AttractionBehavior(mousePos, 1000, 1.9);
						physics.addBehavior(mouseAttractor);
						
					}

					p.draw = function(){
						
						if(initLazyLoad == true){

							p.background(245);
							physics.update();

							for (var i=0; i<springsInLetter.length; i++ ){
								var s = springsInLetter[i];
								p.noFill();
								p.strokeWeight(5);
								p.line(s.a.x,s.a.y,s.b.x,s.b.y);
							}

							for(var i = 0;i<physics.particles.length; i++) {
								var myParticle= physics.particles[i];
								p.strokeWeight(2);
								p.stroke(255);
								p.fill(0);
								p.ellipse(myParticle.x,myParticle.y,9,9);
		  					}
						}
						else{
							p.background(22,145,245);
						}

						mousePos.x = p.mouseX;
						mousePos.y = p.mouseY;
					}

					$(window).scroll(function(){
						p.lazyload();
					})

					p.buildLetter = function(){
						
						shape.forEach(function(e) {

			      			var counter=0;

			      			e.attrs.path.forEach(function(vertex) {
			      				var x = vertex[1];
			      				var y = vertex[2];

			      				if (typeof x !== "undefined" && typeof y !== "undefined") {

			      					//console.log( ' |x:' + x + ' |y:' + y + ' |id:' + counter);
			      					particlePosition = new Vec2D(x*scaleFactor, y*scaleFactor);
			      					initParticlePosition = new Vec2D(0, 0);
			      					var particle = new VerletParticle2D(particlePosition);
			      					var particleFixed = new VerletParticle2D(particlePosition);
			      					particleFixed.lock();			      					
			      					physics.addParticle(particle);
		      						physics.addSpring(new VerletConstrainedSpring2D(particleFixed, particle, 0, 0.01))

			      					if (typeof previousParticle !== "undefined"){
			      						var v1 = p.createVector(particle.x, particle.y);
			      						var v2 = p.createVector(previousParticle.x, previousParticle.y);
			      						var distance = v1.dist(v2);

			      						var mySpring = new VerletSpring2D(previousParticle, particle, distance, 0.1);
			      						springsInLetter.push(mySpring);
			      						physics.addSpring(mySpring);
			      						//physics.addSpring(new VerletSpring2D(previousParticle, particle, distance, 0.1));
			      					} else {
			      						var lastParticleSource = e.attrs.path[e.attrs.path.length - 2]
			      						var lastParticlePositionX = lastParticleSource[1]*scaleFactor;
			      						var lastParticlePositionY = lastParticleSource[2]*scaleFactor;
			      						var lastParticlePosition = new Vec2D(lastParticlePositionX, lastParticlePositionY);
			      						lastParticle = new VerletParticle2D(lastParticlePosition);
			      						physics.addParticle(lastParticle);
			      						var v1 = p.createVector(particle.x, particle.y);
			      						var v2 = p.createVector(lastParticle.x, lastParticle.y);
			      						var distance = v1.dist(v2);
			      						var mySpring = new VerletSpring2D(lastParticle, particle, distance, 0.1);
			      						springsInLetter.push(mySpring);
			      						physics.addSpring(mySpring);
			      						//physics.addSpring(new VerletSpring2D(lastParticle, particle, distance, 0.1))
			      					}

			      					counter++;
			      					if(counter == e.attrs.path.length-1){
			      						previousParticle = undefined;
			      						counter=0;
			      					} else{
			      						previousParticle = particle;
			      					}
								}
			      			});
						});

						// connect particles with equal positions
						var pi, pj;
						for (var i = 0; i < physics.particles.length; i++){	
							pi = physics.particles[i];
							for (var j = 0; j < physics.particles.length; j++){
								pj = physics.particles[j];
								if(i !== j){
									if(pi.x == pj.x && pi.y == pj.y){
										var v1 = p.createVector(pi.x, pi.y);
			      						var v2 = p.createVector(pj.x, pj.y);
			      						var distance = v1.dist(v2); // ??
										physics.addSpring(new VerletSpring2D(pi, pj, 0, 1));
									}
								}
							}
						}
					}

					p.lazyload = function(){
						
						var wt = $(window).scrollTop();    	//* top of the window
						var wb = wt + $(window).height();  	//* bottom of the window
						var ot = $(document.getElementById(myLetterUnicode)).offset().top;
						var ob = $(document.getElementById(myLetterUnicode)).height(); 	//* bottom of object

						initLazyLoad = false;
						
						if( wt<=ot || wb >= ob ){
						    initLazyLoad = true;
						}

						if( wb<=ot ){
						    initLazyLoad = false;
						}		
						if(wt>=ot+height*scaleFactor){
							initLazyLoad = false;
						}			
					}

					p.mousePressed = function() {
					  
					  selected=null;
					  mousePosDrag = new Vec2D(p.mouseX, p.mouseY);
					  for(var i = 0; i<physics.particles.length;i++) {
					    var myParticle = physics.particles[i];
					    if (myParticle.distanceToSquared(mousePos)<snapDist) {
					      selected=myParticle;
					      selected.lock();
					      break;
					    }   
					  }					  
					}

					p.mouseDragged = function() {
					  if (selected!=null) {
					    selected.set(p.mouseX,p.mouseY);
					  }
					}

					p.mouseReleased = function() {
					  if (selected!=null) {
					    selected.unlock();
					    selected=null;
					  }
					}

					var elt = document.getElementById(letters[myCounter]);
					var letterInfo = p.createDiv( "<p>" + "&#x" + letters[myCounter] + "&#x0020" + "U+" + letters[myCounter] + "</p>" );
					letterInfo.class("letterInfo");
					letterInfo.parent(elt);
				}
				
		    	var containerNode = document.getElementById(letters[myCounter]);
				myp5 = new p5(sketch, containerNode);
				myCounter++;

		    }
		});
	};
});



/////////////
/* BACKUPZ */
/////////////

// ladzy load snip
	  					
	  					/*$(document).ready(function(){
						   $(window).scroll(lazyload);
						   lazyload();
						});
						*/
						////////////////////
	  					/*
	  					function lazyload(){
							var wt = $(window).scrollTop();    //* top of the window
							var wb = wt + $(window).height();  //* bottom of the window

							$(".ads").each(function(){
							  var ot = $(this).offset().top;  //* top of object (i.e. advertising div)
							  var ob = ot + $(this).height(); //* bottom of object

							  if(!$(this).attr("loaded") && wt<=ob && wb >= ot){
							     $(this).html("here goes the iframe definition");
							     $(this).attr("loaded",true);
							  }
							});
						}
						*/

												/*
						if(  wt<=ob && wb >= ot){ 
						    console.log(myLetterUnicode + "is visible");
						    initLazyLoad = true;    
						} */
						/*
						if( wt<=ot && wb >= ob ){
						    initLazyLoad = true;
						    console.log(" wt<=ot && wb >= ob");
						}*/


													//

						/*var wt = $(window).scrollTop();    	//* top of the window
						var wb = wt + $(window).height();  	//* bottom of the window
						var ot = $(document.getElementById(myLetterUnicode)).offset().top;
						var ob = $(document.getElementById(myLetterUnicode)).height(); 	//* bottom of object
						if( !$(document.getElementById(myLetterUnicode)).attr("loaded") && wt<=ob && wb >= ot){ //!$(document.getElementById(letters[myCounter])).attr("loaded") &&
						    console.log(myLetterUnicode + "is visible");
						    initLazyLoad = true;
						    $(document.getElementById(myLetterUnicode)).attr("loaded",true);
						} else{
							console.log(myLetterUnicode + "is hidden");
							initLazyLoad = false;
							$(document.getElementById(myLetterUnicode)).attr("loaded",false);
						}*/