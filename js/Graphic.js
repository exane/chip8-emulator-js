var Graphic = (function(){
  var Graphic = function(){
    if(!(this instanceof Graphic)){
      return (new Graphic());
    }
    /**
     * constructor here
     */
    this._canvas = document.querySelector("canvas");
    this._ctx = this._canvas.getContext("2d");
    this._canvas.height = 32*this._scale;
    this._canvas.width = 64*this._scale;
  };
  var r = Graphic.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r._ctx = null;
  r._canvas = null;
  r._scale = 10;
  r.color = {
    black: "black",
    white: "white",
    green: "#00ff00"
  }

  r.clear = function(){
    this._ctx.fillStyle = this.color.black;
    this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  r.draw = function(x, y, width = 1, height = 1){
    this._ctx.fillStyle = this.color.green;
    this._ctx.fillRect(x * this._scale, y * this._scale, width * this._scale, height * this._scale);
  }

  r.drawPixel = function(x, y){
    this.draw(x, y);
  }

  r.drawGfx = function(gfx){
    var x, y;
    for(var i = 0; i < gfx.length; i++) {
      y = i >> 6;
      x = i % 64;
      if(!gfx[x + y*64]) continue;
      this.drawPixel(x, y);
    }
  }


  return Graphic;
})();

module.exports = Graphic;