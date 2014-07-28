function randomRange(min, max) {
	return ((Math.random() * (max - min)) + min);
}
function hexToR(h) {
	return parseInt((cutHex(h)).substring(0,2),16);
}
function hexToG(h) {
	return parseInt((cutHex(h)).substring(2,4),16);
}
function hexToB(h) {
	return parseInt((cutHex(h)).substring(4,6),16);
}
function cutHex(h) {
	return (h.charAt(0)=="#") ? h.substring(1,7):h;
}
if (!window.requestAnimationFrame) {

    window.requestAnimationFrame = ( function() {

          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  window.oRequestAnimationFrame      ||
                  window.msRequestAnimationFrame     ||
                  function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                  };
        })();
}
var MAX_PARTICLES = 50;
var NOW_PARTICLES = 50;
var COLOR = "#ffffff";
var TYPE_PARTICLE = "circle";
var POSITION = "random";
var RANDOM_COLOR = 0;
var VELOCITY = 0.5;
var BACK_COLOR= "transparent";
var MAX_SIZE = 20;
var STROKE_SIZE = 3;
var STROKE_COLOR = "#ffffff";
var OPACITY = 0.15;
var RANDOM_SIZE = 1;
var PARTICLE_SIZE = 5;
var DEAD_PARTICLE = 1;
var SHADOW_BLUR = 0;

var mousePosX = window.innerWidth/2;
var mousePosY = window.innerHeight/2;
var stats;
var canvas;
var c;
var particleArray = [];

window.onload = function() {
  init();
};

$(window).resize(function(){
  var canvas = document.getElementById("canvas");
  canvas.width=window.innerWidth;
  canvas.height = window.innerHeight;
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.top - root.scrollTop;
  var mouseY = evt.clientY - rect.left - root.scrollLeft;
  return {
      x: mouseX,
      y: mouseY
  };
}

function createParticle(){

  var particle = {};

  switch (POSITION){
  case "mouse":
    particle.x = mousePosX;
    particle.y = mousePosY;
    break;
  case "center":
    particle.x = window.innerWidth/2;
    particle.y = window.innerHeight/2;
    break;
  case "random":
    particle.x = randomRange(0,window.innerWidth);
    particle.y = randomRange(0,window.innerHeight);
    break;
  }

  particle.xSpeed = randomRange( (-1) * VELOCITY , VELOCITY);
  particle.ySpeed = randomRange( (-1) * VELOCITY , VELOCITY);

  var size;
  if(RANDOM_SIZE==1){
    size = randomRange(1,MAX_SIZE);
  }else{
    size = PARTICLE_SIZE;
  }
  particle.size  = size;

  return particle;
}

function init(){

    canvas = document.getElementById("canvas");
    c = canvas.getContext("2d");
    c.canvas.width  = window.innerWidth;
    c.canvas.height = window.innerHeight;

    canvas.addEventListener("mousemove", function(evt) {
      var mousePos = getMousePos(canvas, evt);
      mousePosX = mousePos.x;
      mousePosY = mousePos.y;
    }, false);

    generateParticles();
    animate();
}

function generateParticles(){
  for (var i = 0; i < MAX_PARTICLES; i++) {
        particleArray.push(createParticle());
    }
}

function draw(){

  c.clearRect(0,0,window.innerWidth,window.innerHeight);
  c.fillStyle = BACK_COLOR;
  c.fillRect(0,0,window.innerWidth,window.innerHeight);

  for(var i=0; i<NOW_PARTICLES;i++){

      var particle = particleArray[i];

      var particle_color = COLOR;
      if(RANDOM_COLOR==1){
        var r = Math.random()*255>>0;
        var g = Math.random()*255>>0;
        var b = Math.random()*255>>0;
        particle_color = "rgba("+r+", "+g+", "+b+", "+OPACITY+")";
      }else{
        particle_color = "rgba("+hexToR(particle_color)+", "+hexToG(particle_color)+", "+hexToB(particle_color)+", "+OPACITY+")";
      }

      c.beginPath();

      c.lineWidth = STROKE_SIZE;
      c.fillStyle = particle_color;

      if(SHADOW_BLUR>0){
        c.shadowBlur = SHADOW_BLUR;
        c.shadowOffsetX = 1;
        c.shadowOffsetY = 1;
        c.shadowColor = "rgba(100, 100, 100, 1)";
      }else{
        c.shadowBlur = null;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 0;
        c.shadowColor = "rgba(100, 100, 100, 0)";
      }

      var particle_stroke_color = "rgba("+hexToR(STROKE_COLOR)+", "+hexToG(STROKE_COLOR)+", "+hexToB(STROKE_COLOR)+", "+OPACITY+")";
      c.strokeStyle = particle_stroke_color;

      switch (TYPE_PARTICLE){
        case "rect":
          c.fillRect(particle.x, particle.y, particle.size, particle.size);
          if(STROKE_SIZE>0){
            c.strokeRect(particle.x, particle.y, particle.size, particle.size);
          }
          break;
        case "circle":
          var radius = particle.size/2;
          c.arc(particle.x, particle.y, radius, 0, 2 * Math.PI, false);
          c.fill();
          if(STROKE_SIZE>0){
            c.stroke();
          }
          break;
        case "triangle":
          c.moveTo(particle.x, particle.y);
          c.lineTo(particle.x + (particle.size*2) , particle.y);
          c.lineTo(particle.x + particle.size , particle.y - particle.size);
          c.lineTo(particle.x, particle.y);
          c.fill();
          if(STROKE_SIZE>0){
            c.stroke();
          }
          break;
        }

      c.closePath();

      particle.x = particle.x + particle.xSpeed;
      particle.y = particle.y + particle.ySpeed;

      if(DEAD_PARTICLE==1){
        particle.size = particle.size * (0.9 + (randomRange(1,10)/100));
        if(particle.size<=0.25){
            particleArray[i] = createParticle();
        }
      }else{

        if(particle.x < -(particle.size) ||
           particle.y < -(particle.size) ||
           particle.x > window.innerWidth+particle.size ||
           particle.y > window.innerHeight+particle.size){
            particleArray[i] = createParticle();
        }
      }
  }
}

function animate(){
    requestAnimationFrame(animate);
    draw();
}
