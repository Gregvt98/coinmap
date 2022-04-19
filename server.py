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
        'mapbox.html', 
        ACCESS_KEY=MAPBOX_ACCESS_KEY,
        marker_data = "<MARKER_DATA>"
    )

@app.route("/locations", methods=["GET"])
def get_geojson():
    url = 'https://coinmap.org/api/v1/venues/'
    payload = {'limit': 1000} #change this default
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
        return jsonify(geojs)

#function to construct request url with query params
#function to construct geojson data

@app.route("/location/<id>", methods=["GET"])
def get_location_data(id):
    url = 'https://coinmap.org/api/v1/venues/' + str(id)
    headers = {'content-type': 'application/json'}
    r = requests.get(url, params=None, headers=headers)
    if r.status_code == 200:
        responsejson = r.json()
        data = responsejson["venue"]
    comments_url = "https://coinmap.org/api/v1/venues/"+ str(id) + "/comments/"
    comments_r = requests.get(comments_url, params=None, headers=headers)
    comments_json = comments_r.json()
    comments = comments_json["comments"]
    return render_template("location.html", data=data, comments_data=comments)

@app.route("/about", methods=["GET"])
def about():
    return render_template("about.html")
