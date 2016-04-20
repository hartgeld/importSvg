
jQuery(document).ready(function(){

	var letters = [ "__U+002a", "__U+002b", "__U+002c", "__U+002d", "__U+002e", "__U+002f",  "__U+003a", "__U+003b", "__U+003c", "__U+003d", "__U+003e", "__U+003f", "__U+004a", "__U+004b", "__U+004c", "__U+004d", "__U+004e", "__U+004f",  "__U+005a", "__U+005b", "__U+005c", "__U+005d", "__U+005e", "__U+005f", "__U+007b", "__U+007c", "__U+007d", "__U+007e", "__U+0020", "__U+0021", "__U+0022", "__U+0023", "__U+0024", "__U+0025", "__U+0026", "__U+0027", "__U+0028", "__U+0029",  "__U+0030", "__U+0031", "__U+0032", "__U+0033", "__U+0034", "__U+0035", "__U+0036", "__U+0037", "__U+0038", "__U+0039",  "__U+0040", "__U+0041", "__U+0042", "__U+0043", "__U+0044", "__U+0045", "__U+0046", "__U+0047", "__U+0048", "__U+0049",  "__U+0050", "__U+0051", "__U+0052", "__U+0053", "__U+0054", "__U+0055", "__U+0056", "__U+0057", "__U+0058", "__U+0059", "__U+2018"] // 
	var myCounter = 0;

	for (var letterCount = 0; letterCount < letters.length; letterCount++) {

		var letterName = letters[letterCount];
		var myUrl = "/home/hartgeld/Websites/importSvg/source/" + letterName + ".svg";

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

				var sketch = function( p ) {

					var physics;
					var center;
					var previousParticle;
					var lastParticle;

					var selected=null;
					var snapDist=20*20;

					p.setup = function() {

						p.createCanvas(width/2, height/2);
						physics = new VerletPhysics2D();
						physics.setWorldBounds(new Rect(1,1,width-1,height-1));
						physics.addBehavior(new GravityBehavior(new Vec2D(0,0)));

						center = new Vec2D(width/2, height/2);

						shape.forEach(function(e) {
							console.log('canvas dimensions |w:'+width+' |h: '+height);
			      			console.log('id:' + e.id + 'vectors: ' + e.attrs.path.length);

			      			var counter=0;

			      			e.attrs.path.forEach(function(vertex) {
			      				var x = vertex[1];
			      				var y = vertex[2];

			      				if (typeof x !== "undefined" && typeof y !== "undefined") {

			      					console.log( ' |x:' + x + ' |y:' + y + ' |id:' + counter);
			      					particlePosition = new Vec2D(x/2, y/2);
			      					var particle = new VerletParticle2D(particlePosition);
			      					var particleFixed = new VerletParticle2D(particlePosition);
			      					particleFixed.lock();
			      					
			      					physics.addParticle(particle);
		      						physics.addSpring(new VerletSpring2D(particleFixed, particle, 0, 0.01))

			      					if (typeof previousParticle !== "undefined"){
			      						var v1 = p.createVector(particle.x, particle.y);
			      						var v2 = p.createVector(previousParticle.x, previousParticle.y);
			      						var distance = v1.dist(v2);
			      						physics.addSpring(new VerletSpring2D(previousParticle, particle, distance, 0.1))
			      					} else {
			      						var lastParticleSource = e.attrs.path[e.attrs.path.length - 2]
			      						var lastParticlePositionX = lastParticleSource[1]/2;
			      						var lastParticlePositionY = lastParticleSource[2]/2;
			      						var lastParticlePosition = new Vec2D(lastParticlePositionX, lastParticlePositionY);
			      						lastParticle = new VerletParticle2D(lastParticlePosition);
			      						physics.addParticle(lastParticle);
			      						var v1 = p.createVector(particle.x, particle.y);
			      						var v2 = p.createVector(lastParticle.x, lastParticle.y);
			      						var distance = v1.dist(v2);
			      						physics.addSpring(new VerletSpring2D(lastParticle, particle, distance, 0.1))
			      					}
			      					
			      					counter++;

			      					if(counter == e.attrs.path.length-1){
			      						console.log('______________________');
			      						previousParticle = undefined;
			      						counter=0;
			      					} else{
			      						previousParticle = particle;
			      					}
								}
			      			});
						});

						console.log('particles_total: ' + physics.particles.length);
						var pi, pj;
						for (var i = 0; i < physics.particles.length; i++){	
							pi = physics.particles[i];
							for (var j = 0; j < physics.particles.length; j++){
								pj = physics.particles[j];
								if(i !== j){
									if(pi.x == pj.x && pi.y == pj.y){
										var v1 = p.createVector(pi.x, pi.y);
			      						var v2 = p.createVector(pj.x, pj.y);
			      						var distance = v1.dist(v2);
										physics.addSpring(new VerletSpring2D(pi, pj, 0, 1))
										p.stroke(0);
			      						p.line(pi.x, pi.y, pj.x, pj.y);
									}
								}
							}
						}					
					}

					p.draw = function(){

						p.background(245);
						p.noFill();
						physics.update();
						
						var springLen = physics.springs.length;
						for(var i =0;i < springLen; i++) {
							var s = physics.springs[i];
							p.strokeWeight(5);
							p.line(s.a.x,s.a.y,s.b.x,s.b.y);
						}

						var partLen = physics.particles.length;
						for(var i = 0;i<partLen; i++) {
							var myParticle= physics.particles[i];
							p.strokeWeight(2);
							p.stroke(255);
							p.fill(0);
							p.ellipse(myParticle.x,myParticle.y,9,9);
	  					}
					}

					p.mousePressed = function() {
					  selected=null;
					  mousePos = new Vec2D(p.mouseX, p.mouseY);
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
					var letterInfo = p.createDiv( "<p>" + letters[myCounter] + "</p>" );
					letterInfo.class("letterInfo");
					letterInfo.parent(elt);
				}
				
		    	var containerNode = document.getElementById(letters[myCounter]);
				var myp5 = new p5(sketch, containerNode);
				myCounter++;

		    }
		});
	};
});