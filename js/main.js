
(function() {

var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 320;
var IMAGES = {
	"mario" : "images/norio.png" ,
	"standing" : "images/norio_standing.png",
	"jumping" : "images/norio_jumping.png",
	"running" : "images/norio_running.png",
};

var system;

//=== util
function getimage(k) {
	return system.getImage(IMAGES[k]);
}

//=== inputs
var inputs = {};
var KEYS = {"left":37,"up":38,"right":39,"down":40};
window.onkeydown = function(e) {
	for (var k in KEYS) {
		if (e.keyCode == KEYS[k]) {
			inputs[k] = true;
			break;
		}
	}
};
window.onkeyup = function(e) {
	for (var k in KEYS) {
		if (e.keyCode == KEYS[k]) {
			inputs[k] = false;
			break;
		}
	}
};



var Main = arc.Class.create(arc.Game, {
	"initialize" : function() {
		var self = this;
		if (arc.ua.isMobile) {
			system.setFullScreen();
		}
		var root = new arc.display.Shape();
		root.beginFill(0x000000, 1.0);
		root.drawRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
		root.endFill();
		this.addChild(root);
		
		this.mario = new Mario();
		this.addChild(this.mario.clip);
		
		this.addEventListener(arc.Event.TOUCH_START, this.touchStartHandler);
		this.addEventListener(arc.Event.TOUCH_MOVE, this.touchMoveHandler);
		this.addEventListener(arc.Event.TOUCH_END, this.touchEndHandler);
	} , 
	"update" : function() {
		this.mario.update();
	},
	"touched" : function(x,y) {
		var res = null;
		if (x > y) {
			// y = SCREEN_WIDTH - x
			if (y < SCREEN_WIDTH - x) 
				res = 'up';
			else 
				res = 'right';
		} else {
			if (y < SCREEN_WIDTH - x) 
				res = 'left';
			else 
				res = 'down';
		}
		return res;
	},
	"touchStartHandler" : function(e) {
		if (this._touched) {
			inputs[this._touched] = false;
			this._touched = null;
		}
		this._touched = this.touched(e.x, e.y);
		inputs[this._touched] = true;
	} , 
	"touchMoveHandler" : function(e) {
		if (this._touched) {
			inputs[this._touched] = false;
			this._touched = null;
		}
		this._touched = this.touched(e.x, e.y);
		inputs[this._touched] = true;
	} , 
	"touchEndHandler" : function(e) {
		if (this._touched) {
			inputs[this._touched] = false;
			this._touched = null;
		}
	}
});
var Mario = arc.Class.create({
	"initialize" : function() {
		this.x = this.y = 0;
		this.dx = this.dy = 0;
		this.ax = 0.5;
		this.ay = 8.0;
		this.friction = 0.85;
		this.gravity = 0.4;
		this.dir = 1;
		
		this.jumping = true;
		
		this.clip = new arc.display.MovieClip();
		this.clip.setX(100);
		this.clip.setY(100);
		
		this.images = {};
		this.images.running = new arc.display.SheetMovieClip(
										getimage('running'), 16,24,true,false);
		this.images.jumping = new arc.display.Sprite(getimage('jumping'));
		this.images.standing = new arc.display.Sprite(getimage('standing'));
		this.images.running.play();
			
		this.setImage('jumping');
	} , 
	"setImage" : function(k) {
		var obj = this.images[k];
		if (this._image == obj) return;
		if (this._image != null) {
			this.clip.removeChild(this._image);
			this._image = null;
		}
		this._image = obj;
		this.clip.addChild(this._image);
	} , 
	"update" : function() {
		this.x = this.clip.getX();
		this.y = this.clip.getY();
	
		if (inputs.up && !this.jumping) {
			this.dy = -this.ay;
			this.jumping = true;
		} else if (this.jumping) {
			//this.dy = this.ay;
		}
		if (inputs.left) {
			this.dx -= this.ax;
			this.dir = -1;
		} else if (inputs.right) {
			this.dx += this.ax;
			this.dir = 1;
		} else {
			//this.dir = 0;
		}
		this.dx *= this.friction;
		if (-0.06 <= this.dx && this.dx <= 0.06) 
			this.dx = 0;
		this.dy += this.gravity;
		
		function _range(n,len) {
			if (n < -len) 
				n = -len;
			if (n > len) 
				n = len;
			return n;
		}
		this.dx = _range(this.dx , 3.0);
		this.dy = _range(this.dy, 8.0);
		
		this.x += this.dx;
		this.y += this.dy;
		this.x = Math.max(32, Math.min(SCREEN_WIDTH - 32, this.x));
		this.y = Math.max(0, Math.min(SCREEN_HEIGHT - 32, this.y));
		
		if (this.y >= SCREEN_HEIGHT - 32) {
			this.jumping = false;
			this.dy = 0;
			this.y = SCREEN_HEIGHT - 32;
		}
		
		if (this.jumping) {
			this.setImage('jumping');
		} else {
			if (this.dx != 0) {
				this.setImage('running');
			} else {
				this.setImage('standing');
			}
		}
		
		this.clip.setX(this.x);
		this.clip.setY(this.y);
		if (this.dir == 1) {
			this._image.setScaleX(1);
			this._image.setX(-1 * this._image.getWidth() );
		} else if (this.dir == -1) {
			this._image.setScaleX(-1);
			this._image.setX(0);
		}
	}
});


window.addEventListener("DOMContentLoaded", function(e) {
	system = new arc.System(SCREEN_WIDTH, SCREEN_HEIGHT, "world");
	system.setGameClass(Main, {});
	
	system.addEventListener(arc.Event.PROGRESS , function(e) {
		console.log(e.loaded + '/' + e.total);
	});
	system.addEventListener(arc.Event.COMPLETE, function() {
		console.log('loaded');
	});
	
	// load images 
	var pathes = [];
	for (var k in IMAGES) 
		pathes.push(IMAGES[k]);
	system.load(pathes);
	//system.start();
}, false);


})(); // (function() {

