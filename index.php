<!DOCTYPE html>
<html>
<head lang="en">
  <meta charset="UTF-8">
  <title>Chip-8 Emulator</title>
  <style>
    .wrapper {
      margin: 0 auto;
      width: 1200px;
    }

    canvas {
      border: 1px solid black;
    }

    .keyboard {

    }
    .keyboard-group {
      clear: left;
    }
    .keyboard-key {
      float: left;
      border: 1px solid black;
      height: 40px;
      width: 40px;
      text-align: center;
      line-height: 40px;
      cursor: default;
      background: #fff;
    }

    .key-pressed {
      background: #9D9D9D
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="">
    <select>
      <?php
        $roms = scandir("./rom");
        foreach($roms as $rom) {
          if($rom == "." || $rom == ".." || $rom == ".gitkeep")
            continue;
          echo "<option value='$rom'>$rom</option>";
        }
      ?>
    </select>
    <button id="loadGame">Load</button>
    <button id="stopGame">Stop</button>
  </div>
  <canvas height="32" width="64"></canvas>
  <div class="keyboard">
    <div class="keyboard-group">
      <div class="keyboard-key key-1">1</div>
      <div class="keyboard-key key-2">2</div>
      <div class="keyboard-key key-3">3</div>
      <div class="keyboard-key key-12">C</div>
    </div>
    <div class="keyboard-group">
      <div class="keyboard-key key-4">4</div>
      <div class="keyboard-key key-5">5</div>
      <div class="keyboard-key key-6">6</div>
      <div class="keyboard-key key-13">D</div>
    </div>
    <div class="keyboard-group">
      <div class="keyboard-key key-7">7</div>
      <div class="keyboard-key key-8">8</div>
      <div class="keyboard-key key-9">9</div>
      <div class="keyboard-key key-14">E</div>
    </div>
    <div class="keyboard-group">
      <div class="keyboard-key key-10">A</div>
      <div class="keyboard-key key-0">0</div>
      <div class="keyboard-key key-11">B</div>
      <div class="keyboard-key key-15">F</div>
    </div>
  </div>
</div>
<script src="build/app.js"></script>
</body>
</html>