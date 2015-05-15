var CPU = (function(){
  var CPU = function(){
    if(!(this instanceof CPU)){
      return (new CPU());
    }
    /**
     * constructor here
     */
    this.init();
  };
  var r = CPU.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r.V = null; //16*8 bit
  r.I = null; // address register 16 bit
  r.pc = null;
  r.stack = null; //16*16 bit
  r.sp = null;
  r.DT = null; //delay timer
  r.ST = null; //sound timer

  r.init = function(){
    this.stack = [];
    this.V = [];
    this.I = 0;
    this.DT = 60;
    this.ST = 60;
    for(var i = 0; i <= 0xf; i++) {
      this.stack[i] = 0;
      this.V[i] = 0;
    }
    this.sp = 0;
    this.pc = 0x200; // start
  }


  return CPU;
})();

module.exports = CPU;