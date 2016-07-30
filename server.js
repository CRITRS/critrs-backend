var rw = require("rw");
var d3 = require("d3");

var animals = getPrimaryData("animals.csv");
var pointsOfInterest = getPrimaryData("points_of_interest.csv");
var byArea = JSON.parse(rw.readFileSync("by_area.json").toString());

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.json());

app.get("/animals", function(request, response) {
  response.json(d3.values(animals));
});

app.get("/nearby/:area_id", function(request, response) {
  var area_id = request.params.area_id;
  if (area_id && area_id in byArea) {
    var areaInfo = byArea[area_id];
    var nearbyInformation = {};

    nearbyInformation.landmarks = areaInfo.landmarks.map(function(d) { return pointsOfInterest[d]; });
    nearbyInformation.animals = d3.set(areaInfo.encounters).values().map(function(d) { return animals[d]; });

    response.json(nearbyInformation);
  } else {
    response.status(500).json({ error: "No such area_id" });
  }
});

// { common_name, animal_avatar_url: cropped original image, type, rarity }
app.post("/overland", function(request, response) {
  var params = request.body;
  if (("area_id" in params) &&
    ("countsSinceLastEncounter" in params) &&
    ("inPark" in params)) {
    var baseProbability = params.inPark ? 0.4 : 0.1;

    var probability = baseProbability * Math.pow(1.3, params.countsSinceLastEncounter);

    if (probability > Math.random()) {
      var animal_id = d3.shuffle(byArea[params.area_id].encounters)[0];
      response.json({ encounter: true, animal: animals[animal_id] });
    } else {
      response.json({ encounter: false });
    }
  } else {
    response.status(500).json({ error: "Invalid request" });
  }
});

app.post("/encounter", function(request, response) {
  var animal_id = request.body.animal_id;
  if (animal_id && animal_id in animals) {
    response.json(animals[animal_id]);
  } else {
    response.status(500).json({ error: "No such animal_id" });
  }
});

port = 80;
app.listen(port, function() {
  console.log("Starting server on " + port);
});


function getPrimaryData(fileName) {
  var data = {};

  d3.csvParse(rw.readFileSync(fileName).toString()).forEach(function(datum) {
    data[datum.id] = datum;
  });

  return data;
}

