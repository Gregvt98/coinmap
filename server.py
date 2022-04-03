from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

app.config.from_envvar('APP_CONFIG_FILE', silent=True)

MAPBOX_ACCESS_KEY = app.config['MAPBOX_ACCESS_KEY']

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

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
        return jsonify(geojs)

#function to construct request url with query params
#function to construct geojson data
