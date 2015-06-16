var Chip8 = require("./Chip8");

(function main(){
  var chip8 = Chip8();
  document.querySelector("#loadGame").addEventListener("click", function(e) {
    var rom = document.querySelector("select");
    chip8.stop();
    chip8 = Chip8();
    chip8.start(rom.options[rom.selectedIndex].value);
  }.bind(this));
  document.querySelector("#stopGame").addEventListener("click", function(e) {
    chip8.stop();
  }.bind(this));

})();
