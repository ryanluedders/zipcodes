var express = require("express");
var fs = require("fs");
var app = express();

const ONE_MILE_IN_METERS = 1609.34;

const raw = fs.readFileSync("2021_Gaz_zcta_national.txt", "utf8");
const lines = raw.split("\n");
const zipdata = {};

for (let line of lines) {
    const fields = line.split("\t").map((f) => f.trim());
    const zd = {
        lat: fields[5],
        lon: fields[6]
    }
    zipdata[fields[0]] = zd;
}

app.get("/zip", (req, res, next) => {
    const requestedZip = req.query.zip;
    if (!requestedZip || !zipdata[requestedZip]) {
        res.sendStatus(404);
    } else {
        res.json(zipdata[req.query.zip]);
    }
});

const distance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres

    return d;
}

app.get("/zipdistance", (req, res, next) => {
    const zip1 = req.query.zip1;
    const zip2 = req.query.zip2;

    if (!zip1
        || !zipdata[zip1]
        || !zip2
        || !zipdata[zip2]) {
            res.sendStatus(404);
    }

    const lat1 = zipdata[zip1].lat;
    const lat2 = zipdata[zip2].lat;
    const lon1 = zipdata[zip1].lon;
    const lon2 = zipdata[zip2].lon;

    const distanceBetween = distance(lat1, lon1, lat2, lon2);
    const distanceBetweenInMiles = distanceBetween / ONE_MILE_IN_METERS;

    res.json({
        "distanceInMeters": distanceBetween,
        "distanceInMiles" : distanceBetweenInMiles
    });
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});
