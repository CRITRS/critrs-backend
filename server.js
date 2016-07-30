var rw = require("rw");
var d3 = require("d3");
var turf = require("turf");
var shapefile = require("shapefile");
var path = require("path");

var animals = getPrimaryData("animals.csv");
var pointsOfInterest = getPrimaryData("points_of_interest.csv");
var byArea = JSON.parse(rw.readFileSync("by_area.json").toString());
var areas;
var parks;

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.set("port", (process.env.PORT || 8999));

app.use(bodyParser.json());

app.get("/animals", function(request, response) {
  response.json(d3.values(animals));
});

app.get("/nearby/:lng/:lat", function(request, response) {
  if (request.params.lng && +request.params.lng && request.params.lat && +request.params.lat) {
    var foundArea = findAreaID(+request.params.lng, +request.params.lat);
    if (foundArea) {
      var areaInfo = byArea[foundArea];
      var nearbyInformation = {};

      nearbyInformation.landmarks = areaInfo.landmarks.map(function(d) { return pointsOfInterest[d]; });
      nearbyInformation.animals = d3.set(areaInfo.encounters).values().map(function(d) { return animals[d]; });

      response.json(nearbyInformation);
    } else {
      response.json({ error: "Not in an area" });
    }
  } else {
    response.status(500).json({ error: "Didn't provide a valid lat/lng" });
  }
});

// { common_name, animal_avatar_url: cropped original image, type, rarity }
app.post("/overland", function(request, response) {
  var params = request.body;
  if (("lng" in params) &&
    ("lat" in params) &&
    ("countsSinceLastEncounter" in params)) {
    var inPark = isInPark(+params.lng, +params.lat);
    var baseProbability = inPark ? 0.4 : 0.1;

    var probability = baseProbability * Math.pow(1.3, params.countsSinceLastEncounter);
    var encounter = false;
    var animal_id = null;

    if (probability > Math.random()) {
      var area_id = findAreaID(+params.lng, +params.lat);
      if (area_id) {
        if (byArea[area_id].encounters.length) {
          animal_id = d3.shuffle(byArea[area_id].encounters)[0];
          encounter = true;
        }
      }
    }

    if (encounter) {
      response.json({ encounter: true, animal: animals[animal_id], inPark: inPark });
    } else {
      response.json({ encounter: false, inPark: inPark });
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

shapefile.read(path.join("DataVic", "Parks_Reserves.shp"), function(err, parks_FC) {
  shapefile.read(path.join("Statistical Area 2", "SA2_2011_AUST.shp"), function(err, sa1_FC) {
    areas = validPolygonFeatures(sa1_FC);
    parks = validPolygonFeatures(parks_FC);

    app.listen(app.get("port"), function() {
      console.log("Starting server on " + app.get("port"));
    });
  });
});

function validPolygonFeatures(collection) {
  return turf.featureCollection(collection.features.filter(function(feature) {
    return feature.geometry !== null && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon");
  }));
}

function findAreaID(lng, lat) {
  var point = turf.point([+lng, +lat]);
  var foundArea = null;
  for (var featureIndex = 0; featureIndex < areas.features.length; featureIndex++) {
    if (turf.inside(point, areas.features[featureIndex])) {
      foundArea = areas.features[featureIndex];
      break;
    }
  }

  if (foundArea) {
    return foundArea.properties.SA2_MAIN;
  } else {
    return null;
  }
}

function isInPark(lng, lat) {
  var point = turf.point([+lng, +lat]);
  for (var featureIndex = 0; featureIndex < parks.features.length; featureIndex++) {
    if (turf.inside(point, parks.features[featureIndex])) {
      return true;
    }
  }

  return false;
}

function getPrimaryData(fileName) {
  var data = {};

  d3.csvParse(rw.readFileSync(fileName).toString()).forEach(function(datum) {
    data[datum.id] = datum;
  });

  return data;
}

