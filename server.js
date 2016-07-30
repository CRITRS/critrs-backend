var rw = require("rw");
var d3 = require("d3");

var animals = {};
d3.csvParse(rw.readFileSync("animals.csv").toString()).forEach(function(animal) {
  animals[+animal.id] = animal;
});

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.json());

// TODO(yuri): Encounter endpoint
// POST /encounter
// { animal_id: animal_id }
// return { image_url: foregrounded image url }
app.post("/encounter", function(request, response) {
  var animal_id = +request.body.animal_id;
  if (animal_id && animal_id in animals) {
    response.json(animals[animal_id]);
  } else {
    response.status(500).json({ error: "No such animal_id" });
  }
});

app.get("/nearby/:area_id", function(request, response) {
  var area_id_raw = request.params.area_id;
  if (area_id_raw && +area_id_raw) {
    var area_id = +area_id_raw;
    response.json({ "some_area_information": area_id });
  } else {
    response.status(500).json({ error: "No such area_id" });
  }
});

// TODO(yuri): Nearby endpoint
// GET /nearby/:area_id
// return { animals: [], parks: [], landmarks: [] }

// TODO(yuri): Overland encounter
// POST /overland
// { area_id: aria_id, countsSinceLastEncounter: 0 }
// return { encouter: true/false, encounter_info:
// { common_name, animal_avatar_url: cropped original image, type, rarity }

app.get("/", function(request, response) {
  response.send("hello world");
});

port = 8999;
app.listen(port, function() {
  console.log("Starting server on " + port);
});
