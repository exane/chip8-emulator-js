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
  </style>
</head>
<body>
<div class="wrapper">
  <select>
    <?php
      $roms = scandir("./rom");
      foreach($roms as $rom) {
        if($rom == "." || $rom == "..") continue;
        echo "<option value='$rom'>$rom</option>";
      }
    ?>
  </select>
  <button id="loadGame">Load</button>
  <canvas height="32" width="64"></canvas>
</div>

<script src="build/app.js"></script>
</body>
</html>