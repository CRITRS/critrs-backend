var turf = require("turf");
var shapefile = require("shapefile");
var path = require("path");
var d3 = require("d3");
var rw = require("rw");

function getPOIFeatureCollection() {
  var pointsOfInterest = d3.csvParse(rw.readFileSync("points_of_interest.csv").toString());

  var poiPoints = pointsOfInterest.map(function(poi) {
    return turf.point([+poi.longitude, +poi.latitude], poi);
  });

  return turf.featureCollection(poiPoints);
}

function getAnimalEncountersFeatureCollection() {
  var animalSightings = d3.csvParse(rw.readFileSync("fake_animal_sightings.csv").toString());

  var animalPoints = animalSightings.map(function(sighting) {
    return turf.point([+sighting.longitude, +sighting.latitude], sighting);
  });

  return turf.featureCollection(animalPoints);
}

// NOTE(yuri): Given a featureCollection collection and a featureCollection of areas,
// populate tagKey of byArea by any tagged SA2_MAINs that match.
function tagCollection(collection, areas, byArea, tagKey) {
  var tagged = turf.tag(collection, areas, "SA2_MAIN", "SA2_ID");
  tagged.features.forEach(function(taggedFeature) {
    if (taggedFeature.properties.SA2_ID) {
      var properties = taggedFeature.properties;
      byArea[properties.SA2_ID][tagKey].push(properties.id);
    }
  });
}

shapefile.read(path.join("Statistical Area 2", "SA2_2011_AUST.shp"), function(err, sa1_FC) {
  var testFilter = function(feature) {
    return feature.properties.STATE_CODE === "2";
    // return feature;
  };

  var sa1ValidFeatures = sa1_FC.features.filter(function(feature) {
    return feature.geometry !== null && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") && testFilter(feature);
  });

  var areas = turf.featureCollection(sa1ValidFeatures);

  var byArea = {};
  areas.features.forEach(function(area) {
    byArea[area.properties.SA2_MAIN] = {
      encounters: [],
      landmarks: [],
    };
  });

  tagCollection(getPOIFeatureCollection(), areas, byArea, "landmarks");
  tagCollection(getAnimalEncountersFeatureCollection(), areas, byArea, "encounters");

  console.log(byArea);
  rw.writeFileSync("by_area.json", JSON.stringify(byArea));
});


