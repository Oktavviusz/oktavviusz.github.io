Notification.requestPermission();

// z 04-js-apis/26-maps-leaflet/leaflet.html
let map = L.map('map').setView([53.430127, 14.564802], 18);
// L.tileLayer.provider('OpenStreetMap.DE').addTo(map);
L.tileLayer.provider('Esri.WorldImagery').addTo(map);
let marker = L.marker([53.430127, 14.564802]).addTo(map);
marker.bindPopup("<strong>Hello!</strong><br>This is a popup.");

document.getElementById("saveButton").addEventListener("click", function() {
  leafletImage(map, function (err, canvas) {
    // here we have the canvas
    let rasterMap = document.getElementById("rasterMap");
    let rasterContext = rasterMap.getContext("2d");

    rasterContext.drawImage(canvas, 0, 0, 400, 400);

    createPuzzle(rasterMap);
  });
});

document.getElementById("getLocation").addEventListener("click", function(event) {
  if (! navigator.geolocation) {
    console.log("No geolocation.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    // z  04-js-apis/25-geolocation/geolocation.html
    document.getElementById("latitude").innerText = lat;
    document.getElementById("longitude").innerText = lon;

    map.setView([lat, lon]);
    L.marker([lat, lon]).addTo(map);
  }, positionError => {
    console.error(positionError);
  });
});

function createPuzzle(rasterMap) {
  let board = document.getElementById("board");
  let table = document.getElementById("table");
  board.innerHTML = "";
  table.innerHTML = "";

  // 16 miejsc na planszy
  for (let i = 0; i < 16; i++) {
    let target = document.createElement("div");
    target.className = "drag-target";
    target.id = "target-" + i;
    board.appendChild(target);
  }

  // podział mapy na 16 elementów
  let pieces = [];
  for (let i = 0; i < 16; i++) {
    let piece = document.createElement("canvas");
    piece.width = 100;
    piece.height = 100;
    piece.id = "piece-" + i;
    piece.className = "item";
    piece.draggable = true;

    let x = (i % 4) * 100;
    let y = Math.floor(i / 4) * 100;
    piece.getContext("2d").drawImage(rasterMap, x, y, 100, 100, 0, 0, 100, 100);

    pieces.push(piece);
  }

  // mieszanie
  pieces.sort(() => Math.random() - 0.5);
  for (let piece of pieces) {
    table.appendChild(piece);
  }

  setupDragAndDrop();
}


// z 04-js-apis/22-drag-and-drop/drag-and-drop.html
function setupDragAndDrop() {

  let items = document.querySelectorAll('.item');
  for (let item of items) {
    item.addEventListener("dragstart", function(event) {
      this.style.outline = "5px dashed #D8D8FF";
      event.dataTransfer.setData("text", this.id);
    });

    item.addEventListener("dragend", function(event) {
      this.style.outline = "none";
    });
  }

  let targets = document.querySelectorAll(".drag-target");
  for (let target of targets) {
    target.addEventListener("dragenter", function (event) {
      this.style.border = "2px solid #7FE9D9";
    });
    target.addEventListener("dragleave", function (event) {
      this.style.border = "2px dashed #7f7fe9";
    });
    target.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
    target.addEventListener("drop", function (event) {
      let myElement = document.querySelector("#" + event.dataTransfer.getData('text'));
      this.appendChild(myElement)
      this.style.border = "2px dashed #7f7fe9";
      checkPuzzle();
    }, false);
  }
}

// weryfikacja
function checkPuzzle() {
  for (let i = 0; i < 16; i++) {
    let target = document.getElementById("target-" + i);
    let piece = target.firstElementChild;
    if (!piece || piece.id !== "piece-" + i) {
      return;
    }
  }

  console.debug("Puzzle ułożone!");
  new Notification("Puzzle ułożone!");
}
