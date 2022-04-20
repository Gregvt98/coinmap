window.onload = loadData;

var locationsData;

//function to load data
function loadData() {
    endpoint = 'http://127.0.0.1:5000/locations'
    $.ajax({
        url: endpoint,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            console.log(result);
            console.log(typeof (result));
            locationsData = result;
        }
    })
}




