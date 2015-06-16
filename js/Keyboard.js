var Keyboard = (function(){
  var Keyboard = function(){
    if(!(this instanceof Keyboard)){
      return (new Keyboard());
    }
    /**
     * constructor here
     */
    this.init();

  };
  var r = Keyboard.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r.keys = [];
  r.keyMap = {};
  r._nextKeyQueue = [];

  r.init = function(){
    for(var i = 0; i <= 0xf; i++) {
      this.keys[i] = {
        pressed: false,
        val: i
      };
    }

    this.keyMap = {
      "49": this.keys[1], //1
      "50": this.keys[2], //2
      "51": this.keys[3], //3
      "81": this.keys[4], //4
      "87": this.keys[5],
      "69": this.keys[6],
      "65": this.keys[7],
      "83": this.keys[8],
      "68": this.keys[9],
      "89": this.keys[10],
      "67": this.keys[11],
      "52": this.keys[12],
      "82": this.keys[13],
      "88": this.keys[0],
      "70": this.keys[14],
      "86": this.keys[15]
    }

    this._listener();
  }

  r._listener = function(){
    for(var key in this.keyMap) {
      document.addEventListener("keydown", this._keydown.bind(this, {key: key}));
      document.addEventListener("keyup", this._keyup.bind(this, {key: key}));
    }
  }

  r._keydown = function(data, e){
    if(e.which != data.key) return;
    this.keyMap[data.key].pressed = true;
    this.pressKey(this.keyMap[data.key].val, true);
    this._nextKeyQueue.forEach(function(cb){
      cb.call(null, this.keyMap[data.key].val);
    }.bind(this));
    this._nextKeyQueue = [];
  }

  r._keyup = function(data, e){
    if(e.which != data.key) return;
    this.keyMap[data.key].pressed = false;
    this.pressKey(this.keyMap[data.key].val, false);
  }

  r.isPressed = function(key){
    return this.keys[key].pressed;
  }

  r.nextKey = function(cb){
    this._nextKeyQueue.push(cb);
  }

  r.pressKey = function(key, b){
    var el = document.querySelector(".key-" + key);
    el.classList.remove("key-pressed");
    if(b)
      el.classList.add("key-pressed");
  }

  return Keyboard;
})();

module.exports = Keyboard;