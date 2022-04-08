from types import CoroutineType
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
    payload = {'limit': 100} #change this default
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

@app.route("/location_popup/<id>", methods=["GET"])
def get_popup_data(id):
    """>>Check if it's possible to return html as a string"""
    url = 'https://coinmap.org/api/v1/venues/' + str(id)
    headers = {'content-type': 'application/json'}
    r = requests.get(url, params=None, headers=headers)
    if r.status_code == 200:
        responsejson = r.json()
        data = responsejson["venue"]
        return jsonify(data)
        """
        f"
        <h4>Name: {data['name']}</h4>
        <h4>City: {data['city']}</h4>
        <p>Phone: {data['phone']}</p>
        <p>Email: {data['email']}</p>
        <p>Website: {data['website']}</p>
        "
        """
