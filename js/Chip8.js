var CPU = require("./CPU");
var Graphic = require("./Graphic");
var Keyboard = require("./Keyboard");


var Chip8 = (function(){
  var Chip8 = function(){
    if(!(this instanceof Chip8)){
      return (new Chip8());
    }
    /**
     * constructor here
     */

    this.reset();
    this.loadSound();
    this.initFont();
    //this.listener();
  };
  var r = Chip8.prototype;
  /**
   * methods && properties here
   * r.property = null;
   * r.getProperty = function() {...}
   */
  r.memory = null; //ram
  r.opcode = null;
  r.cpu = null;
  r.rom = null;
  r.romName = "INVADERS";
  r.font = null;
  r.gfx = null;

  r.g = null;
  r.keyboard = null;

  r._loaded = false;
  r._started = false;
  r._stop = false;
  r._paused = false;

  r.saveCycle = 1500;
  r.cycle = 0;

  r._currentCycle = 0;
  r._cycleClock = 0;

  r.initMemory = function(){
    this.memory = [];
    for(var i = 0; i < 0x1000; i++) {
      this.memory[i] = 0;
    }
  }

  r.initGfx = function(){
    this.gfx = [];
    for(var i = 0; i < 32 * 64; i++) {
      this.gfx[i] = 0;
    }
  }

  r.initFont = function(){
    this.font = [0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
      0x20, 0x60, 0x20, 0x20, 0x70, // 1
      0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
      0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
      0x90, 0x90, 0xF0, 0x10, 0x10, // 4
      0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
      0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
      0xF0, 0x10, 0x20, 0x40, 0x40, // 7
      0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
      0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
      0xF0, 0x90, 0xF0, 0x90, 0x90, // A
      0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
      0xF0, 0x80, 0x80, 0x80, 0xF0, // C
      0xE0, 0x90, 0x90, 0x90, 0xE0, // D
      0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
      0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ]
  }

  r.readData = function(){
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.open('GET', './rom/' + this.romName, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e){
      var uInt8Array = new Uint8Array(this.response); // this.response == uInt8Array.buffer
      self.rom = uInt8Array;
      self.loadIntoRam(uInt8Array);
      self._loaded = true;
    };

    xhr.send();
  }

  r.loadIntoRam = function(data){
    for(var i = 0; i < this.font.length; i++) {
      this.memory[i] = this.font[i];
    }
    for(var i = 0x200, k = 0; k < data.length; i++, k++) {
      this.memory[i] = data[k];
    }
  }

  r.loadSound = function() {
    this.sound = new Audio("./sound.wav");
  }

  r.start = function(name){
    if(!this._started){
      this.romName = name;
      this._started = true;
      this.readData();
    }
    if(!this._loaded){
      setTimeout(this.start.bind(this), 200);
      return;
    }
    console.log("loaded");

    this.startCycle();
    this.render();
  }

  r.startCycle = function(){
    if(this._stop || this._paused) return;
    this.opcode = this.memory[this.cpu.pc++] << 8;
    this.opcode |= this.memory[this.cpu.pc++];

    this.fetchOpcode();

    if(this.cpu.DT > 0){
      this.cpu.DT--;
    }
    if(this.cpu.ST > 0){
      this.sound.play();
      this.cpu.ST--;
    }
    this._currentCycle++;

    setTimeout(this.startCycle.bind(this), 0);
  }

  r.render = function(){
    this.g.clear();
    if(!this._started) return;
    this.g.drawGfx(this.gfx);
    //this.measureClockCycle();
    requestAnimationFrame(this.render.bind(this), null);
  }

  r.fetchOpcode = function(){
    //0x3 => 0x1
    //console.log(this.opcode.toString(16));
    var cpu = this.cpu;
    var opcode = this.opcode;
    var fetch = this.fetch();

    switch(opcode & 0xf000) {
      case 0x0:
        switch(opcode & 0xfff) {
          case 0x0E0:
            fetch.CLS();
            break;
          case 0x0EE:
            fetch.RET();
            break;
          default:
            this.unknownOpcode();
            return;
        }
        break;
      case 0x1000:
        fetch.JP(opcode & 0xfff);
        break;
      case 0x2000: // 2nnn | increase SP, then put PC on top of stack. set pc then to nnn
        fetch.CALL(opcode & 0xfff);
        break;
      case 0x3000: // 3xkk | skip next if Vx == kk
        fetch.SE(cpu.V[(opcode & 0xf00) >> 8], opcode & 0xff);
        break;
      case 0x4000:
        fetch.SNE(cpu.V[(opcode & 0xf00) >> 8], (opcode & 0xff));
        break;
      case 0x5000:
        fetch.SE(cpu.V[(opcode & 0xf00) >> 8], cpu.V[(opcode & 0xf0) >> 4]);
        break;
      case 0x6000: //6xkk | set Vx = kk
        var kk = opcode & 0xff;
        var x = (opcode & 0xf00) >> 8;
        fetch.LD("V", kk, x);
        break;
      case 0x7000:
        fetch.ADD("V", opcode & 0xff, (opcode & 0xf00) >> 8);
        break;
      case 0x8000:
        switch(opcode & 0xf) {
          case 0:
            fetch.LD("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 1:
            fetch.OR("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 2:
            fetch.AND("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 3:
            fetch.XOR("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 4:
            fetch.ADD("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 5:
            fetch.SUB("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 6:
            fetch.SHR("V", (opcode & 0xf00) >> 8);
            break;
          case 7:
            fetch.SUBN("V", cpu.V[(opcode & 0xf0) >> 4], (opcode & 0xf00) >> 8);
            break;
          case 0xE:
            fetch.SHL("V", (opcode & 0xf00) >> 8);
            break;
          default:
            this.unknownOpcode();
            return;
        }
        break;
      case 0x9000:
        var Vx, Vy;
        Vx = cpu.V[(opcode & 0xf00) >> 8];
        Vy = cpu.V[(opcode & 0xf0) >> 4];
        fetch.SNE(Vx, Vy);
        break;
      case 0xA000: //Annn | set I = nnn
        fetch.LD("I", opcode & 0xfff);
        break;
      case 0xB000: //Bnnn | jump to nnn + V[0]
        fetch.JP((opcode & 0xfff) + cpu.V[0]);
        break;
      case 0xC000:
        fetch.RND("V", opcode & 0xff, (opcode & 0xf00) >> 8);
        break;
      case 0xD000: //Dxyn | draw n bytes to x, y; set collisionflag (V[f])
        fetch.DRW();
        break;
      case 0xE000:
        switch(opcode & 0xff) {
          case 0x9E:
            fetch.SKP(cpu.V[(opcode & 0xf00) >> 8]);
            break;
          case 0xA1:
            fetch.SKNP(cpu.V[(opcode & 0xf00) >> 8]);
            break;
          default:
            this.unknownOpcode();
            return;
        }
        break;
      case 0xF000:
        switch(opcode & 0xff) {
          case 0x07:
            fetch.LD("V", cpu.DT, (opcode & 0xf00) >> 8);
            break;
          case 0x0A:
            this.keyboard.nextKey(function(key){
              this._paused = false;
              cpu.V[(opcode & 0xf00) >> 8] = key;
              this.startCycle();
            }.bind(this));
            this._paused = true;
            break;
          case 0x15:
            fetch.LD("DT", cpu.V[(opcode & 0xf00) >> 8]);
            break;
          case 0x18:
            fetch.LD("ST", cpu.V[(opcode & 0xf00) >> 8]);
            break;
          case 0x1E:
            fetch.ADD("I", cpu.V[(opcode & 0xf00) >> 8]);
            break;
          case 0x29:
            var x = (opcode & 0xf00) >> 8;
            var Vx = cpu.V[x];
            fetch.LD("I", this.memory[Vx] * 5);
            break;
          case 0x33:
            var x = (opcode & 0xf00) >> 8;
            var Vx = cpu.V[x]; //i.e. 235
            fetch.LD("B", Vx)
            break;
          case 0x55:
            for(var i = 0; i < ((opcode & 0xf00) >> 8); i++) {
              this.memory[cpu.I + i] = cpu.V[i];
            }
            break;
          case 0x65:
            var x = (opcode & 0xf00) >> 8;
            for(var i = 0; i <= x; i++) {
              fetch.LD("V", cpu.I + i, i);
            }
            break;
          default:
            this.unknownOpcode();
            return;
        }
        break;
      default:
        this.unknownOpcode();
        return;
    }
    /*if(this.saveCycle < this.cycle){
      throw "inf loop";
    }*/
    this.cycle++;
  }

  r.fetch = function(){
    var cpu = this.cpu;
    var self = this;

    return {
      CALL: function(addr){
        cpu.stack[cpu.sp] = cpu.pc;
        cpu.sp++;
        cpu.pc = addr;
      },
      RET: function(){
        cpu.sp--;
        cpu.pc = cpu.stack[cpu.sp];
      },
      CLS: function(){
        self.gfx = self.gfx.map(function(pixel){
          return 0;
        });
      },
      RND: function(setAttr, byte, index = -1){
        var rnd = (Math.random() * 0xff) | 0;
        if(index < 0){
          cpu[setAttr] = rnd & byte;
          return;
        }
        cpu[setAttr][index] = rnd & byte;
      },
      OR: function(attr, value, index = -1){
        cpu[attr][index] |= value;
      },
      XOR: function(attr, value, index = -1){
        cpu[attr][index] ^= value;
      },
      AND: function(attr, value, index = -1){
        if(index < 0){
          cpu[attr] &= value;
          return;
        }
        cpu[attr][index] &= value;
      },
      SE: function(left, right){
        if(left == right){
          cpu.pc += 2;
        }
      },
      SNE: function(left, right){
        if(left != right){
          cpu.pc += 2;
        }
      },
      SKP: function(key){
        if(self.keyboard.isPressed(key)){
          cpu.pc += 2;
        }
      },
      SKNP: function(key){
        if(!self.keyboard.isPressed(key)){
          cpu.pc += 2;
        }
      },
      LD: function(setAttr, from, index = -1){
        if(setAttr == "B"){
          //i.e. 235
          var v1, v2, v3;

          v1 = (from / 100) | 0; //2
          v2 = (from % 100 / 10) | 0; //3
          v3 = from % 10; //5

          self.memory[cpu.I] = v1;
          self.memory[cpu.I + 1] = v2;
          self.memory[cpu.I + 2] = v3;
          return;
        }
        if(index < 0){
          cpu[setAttr] = from;
          return;
        }
        cpu[setAttr][index] = from;
      },
      JP: function(addr){
        cpu.pc = addr;
      },
      ADD: function(setAttr, from, index = -1){
        var res = null;
        if(index < 0){
          res = cpu[setAttr] += from;
        }
        else {
          res = cpu[setAttr][index] += from;
        }

        cpu.V[0xf] = 0;
        if(res >= 0xff){
          cpu.V[0xf] = 1;
          var a = res & 0xff;
          if(index < 0){
            cpu[setAttr] = a;
          }
          else {
            cpu[setAttr][index] = a;
          }
        }
      },
      SUB: function(attr, byte, index = -1){
        cpu.V[0xf] = 0;
        if(cpu[attr][index] > byte){
          cpu.V[0xf] = 1;
        }
        cpu[attr][index] = cpu[attr][index] - byte;
      },
      SUBN: function(attr, byte, index = -1){
        cpu.V[0xf] = 0;
        if(cpu[attr][index] < byte){
          cpu.V[0xf] = 1;
        }
        cpu[attr][index] = byte - cpu[attr][index];
      },
      SHR: function(attr, index){
        cpu.V[0xf] = 0;
        if(cpu[attr][index] & 0x1){
          cpu.V[0xf] = 1;
        }
        cpu[attr][index] = cpu[attr][index] >> 1;
      },
      SHL: function(attr, index){
        cpu.V[0xf] = 0;
        if(cpu[attr][index] & 0x1){
          cpu.V[0xf] = 1;
        }
        cpu[attr][index] = cpu[attr][index] << 1;
      },
      DRW: function(){
        var opcode = self.opcode;
        var x = cpu.V[(opcode & 0xf00) >> 8];
        var y = cpu.V[(opcode & 0xf0) >> 4];
        var rowByte, rowString, n;
        //x + y * 8

        cpu.V[0xf] = 0;

        var height = opcode & 0xf;
        for(var i = 0; i < height; i++) {
          rowByte = self.memory[cpu.I + i];
          for(var k = 0; k < 8; k++) {
            var z = ((y + i) * 64 + (x + k));
            if((rowByte & (0x80 >> k)) == 0/* || z > 2048*/) continue;
            if(self.gfx[z] == 1)
              cpu.V[0xf] = 1;
            self.gfx[z] ^= 1;
          }
        }
      }
    }
  }

  r.unknownOpcode = function(){
    console.log("unknown opcode: 0x%s", this.opcode.toString(16));
    this._stop = true;
  }

  r.measureClockCycle = function(){
    var now = Date.now();
    if(now >= this._cycleClock + 1000){
      console.log("Hz: %d", this._currentCycle);
      this._currentCycle = 0;
      this._cycleClock = now;
    }
  }

  r.listener = function() {
    document.querySelector("#loadGame").addEventListener("click", function(e) {
      var rom = document.querySelector("select");
      this.reset();
      this.start(rom.options[rom.selectedIndex].value);
    }.bind(this));
  }

  r.reset = function() {
    this._loaded = false;
    this._started = false;
    this._stop = false;
    this._paused = false;

    this.romName = null;
    this.opcode = null;
    this.cpu = null;

    this.keyboard = Keyboard();
    this.g = Graphic();


    this.cpu = CPU();
    this.initMemory();
    this.initGfx();
  }

  r.stop = function() {
    this.reset();
  }

  return Chip8;
})();

module.exports = Chip8;