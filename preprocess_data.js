var turf = require("turf");
var shapefile = require("shapefile");
var path = require("path");
var d3 = require("d3");
var rw = require("rw");

var pointsOfInterest = d3.csvParse(rw.readFileSync("points_of_interest.csv").toString());
pointsOfInterest.forEach(function(poi) {
  poi.id = +poi.id;
});

console.log(pointsOfInterest);


// shapefile.read(path.join("Statistical Area 2", "SA2_2011_AUST.shp"), function(err, sa1_FC) {
//   var animalSightings = d3.csvParse(rw.readFileSync("fake_animal_sightings.csv").toString());

//   var animalPoints = animalSightings.map(function(sighting) {
//     return turf.point([sighting.longitude, sighting.latitude], {
//       animal_id: +sighting.animal_id,
//     });
//   });

//   var allAnimalPoints = turf.featureCollection(animalPoints);

//   var testFilter = function(feature) {
//     return feature.properties.STATE_CODE === "2";
//     // return feature;
//   };

//   var sa1ValidFeatures = sa1_FC.features.filter(function(feature) {
//     if (feature.properties.SA2_MAIN === "206041122") console.log(feature.properties);
//     return feature.geometry !== null && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") && testFilter(feature);
//   });

//   var areas = turf.featureCollection(sa1ValidFeatures);
//   // console.log(areas);
//   var tagged = turf.tag(allAnimalPoints, areas, "SA2_MAIN", "SA2_ID");
//   console.log(tagged.features);

//   var encountersByArea = {};
//   tagged.features.forEach(function(taggedFeature) {
//     if (taggedFeature.properties.SA2_ID) {
//       var properties = taggedFeature.properties;
//       if (properties.SA2_ID in encountersByArea) {
//         encountersByArea[properties.SA2_ID].push(properties.animal_id);
//       } else {
//         encountersByArea[properties.SA2_ID] = [ properties.animal_id ];
//       }
//     }
//   });

//   console.log(encountersByArea);

// });


