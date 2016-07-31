var turf = require("turf");
var shapefile = require("shapefile");
var path = require("path");
var d3 = require("d3");
var rw = require("rw");

function getPOIFeatureCollection() {
  var pointsOfInterest = d3.csvParse(rw.readFileSync(path.join("data", "points_of_interest.csv")).toString());

  var poiPoints = pointsOfInterest.map(function(poi) {
    return turf.point([+poi.longitude, +poi.latitude], poi);
  });

  return turf.featureCollection(poiPoints);
}

function getAnimalEncountersFeatureCollection() {
  var animalSightings = d3.csvParse(rw.readFileSync(path.join("data", "animal_sightings.csv")).toString());

  var animalPoints = animalSightings.map(function(sighting) {
    return turf.point([+sighting.longitude, +sighting.latitude], sighting);
  });

  return turf.featureCollection(animalPoints);
}

// NOTE(yuri): Given a featureCollection collection and a featureCollection of areas,
// populate tagKey of byArea by any tagged area ids
function tagCollection(collection, areas, byArea, tagKey) {
  console.log("tagging collection", tagKey);
  var tagged = turf.tag(collection, areas, "LC_PLY_PID", "AREA_ID");
  tagged.features.forEach(function(taggedFeature) {
    if (taggedFeature.properties.AREA_ID) {
      var properties = taggedFeature.properties;
      console.log(properties);
      byArea[properties.AREA_ID][tagKey].push(properties.id);
    }
  });
}

shapefile.read(path.join("shapes", "Suburbs", "VIC_LOCALITY_POLYGON_shp.shp"), function(err, suburbFC) {
  var validFeatures = suburbFC.features.filter(function(feature) {
    return feature.geometry !== null && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon");
  });

  var areas = turf.featureCollection(validFeatures);

  var byArea = {};
  areas.features.forEach(function(area) {
    byArea[area.properties.LC_PLY_PID] = {
      encounters: [],
      landmarks: [],
    };
  });

  tagCollection(getPOIFeatureCollection(), areas, byArea, "landmarks");
  tagCollection(getAnimalEncountersFeatureCollection(), areas, byArea, "encounters");

  console.log(byArea);
  rw.writeFileSync(path.join("generated_data", "by_area.json"), JSON.stringify(byArea));
});


