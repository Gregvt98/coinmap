import requests
# there is inbuilt json() constructor for requests.get() method
json_data = requests.get("https://coinmap.org/api/v1/venues/").json()
#print(json_data)

# To actually write the data to the file, we just call the dump() function from json library
import json
with open('venues.json', 'w') as json_file:
    json.dump(json_data, json_file)