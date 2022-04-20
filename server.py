from sre_constants import AT_MULTILINE
from types import CoroutineType
from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

app.config.from_envvar('APP_CONFIG_FILE', silent=True)

MAPBOX_ACCESS_KEY = app.config['MAPBOX_ACCESS_KEY']

@app.route("/")
def home():
    return render_template(
        'home.html', 
        home_message="This is the home page"
    )

@app.route('/mapbox')
def mapbox_js():
    return render_template(
        'newmapbox.html', 
        ACCESS_KEY=MAPBOX_ACCESS_KEY,
        marker_data = "<MARKER_DATA>"
    )

@app.route('/oldmapbox')
def newmapbox_js():
    return render_template(
        'mapbox.html', 
        ACCESS_KEY=MAPBOX_ACCESS_KEY,
        marker_data = "<MARKER_DATA>"
    )

@app.route("/locations", methods=["GET"])
def get_geojson():
    url = 'https://coinmap.org/api/v1/venues/'
    payload = {'limit': 10000} #change this default
    headers = {'content-type': 'application/json'}
    r = requests.get(url, params=payload, headers=headers)
    if r.status_code == 200:
        responsejson = r.json()
        data = responsejson["venues"]
        geojs={
            "type": "FeatureCollection",
            "features":[
                {
                        "type":"Feature",
                        "geometry": {
                        "type":"Point",
                        "coordinates":[d["lon"], d["lat"]],
                    },
                        "properties": {
                            "id": d["id"],
                            "category": d["category"],
                            "name": d["name"]
                        },
                
                } for d in data
            ]  
        }

        for feature in geojs["features"]:
            if feature["properties"]["category"] == "atm":
                feature["properties"]["icon"] = "bank"
            elif feature["properties"]["category"] == "cafe":
                feature["properties"]["icon"] = "cafe"
            elif feature["properties"]["category"] == "grocery":
                feature["properties"]["icon"] = "grocery"
            elif feature["properties"]["category"] == "shopping":
                feature["properties"]["icon"] = "shop"
            elif feature["properties"]["category"] == "lodging":
                feature["properties"]["icon"] = "lodging"
            elif feature["properties"]["category"] == "nightlife":
                feature["properties"]["icon"] = "bar"
            elif feature["properties"]["category"] == "attraction":
                feature["properties"]["icon"] = "attraction"
            elif feature["properties"]["category"] == "food":
                feature["properties"]["icon"] = "restaurant"
            elif feature["properties"]["category"] == "transport":
                feature["properties"]["icon"] = "car"
            elif feature["properties"]["category"] == "sports":
                feature["properties"]["icon"] = "tennis"
            elif feature["properties"]["category"] == "Travel Agency" or feature["properties"]["category"] == "travel agency": #or travel agency
                feature["properties"]["icon"] = "globe"
            elif feature["properties"]["category"] == "trezor retailer":
                feature["properties"]["icon"] = ""
            elif feature["properties"]["category"] == "default":
                feature["properties"]["icon"] = ""
        
        return jsonify(geojs)

#function to construct request url with query params
#function to construct geojson data

@app.route("/location/page/<id>", methods=["GET"])
def get_location_data(id):
    url = 'https://coinmap.org/api/v1/venues/' + str(id)
    headers = {'content-type': 'application/json'}
    r = requests.get(url, params=None, headers=headers)
    if r.status_code == 200:
        responsejson = r.json()
        data = responsejson["venue"]
    else:
        data = jsonify("No data available for location id: ", id)
        return data

    comments_url = "https://coinmap.org/api/v1/venues/"+ str(id) + "/comments/"
    comments_r = requests.get(comments_url, params=None, headers=headers)
    comments_json = comments_r.json()
    comments = comments_json["comments"]

    ratings_url = "https://coinmap.org/api/v1/venues/" + str(id) + "/ratings/"
    ratings_r = requests.get(ratings_url, params=None, headers=headers)
    ratings_json = ratings_r.json()
    ratings = ratings_json["rating"]

    return render_template("location.html", data=data, comments_data=comments, ratings_data = ratings)

@app.route("/about", methods=["GET"])
def about():
    return render_template("about.html")
