/**
 * Created by Kim on 2017-04-18.
 */
var monitorRequest;



function getBestMatchingStops(name, callback) {

    var http = new XMLHttpRequest();
    var url = "https://api.vasttrafik.se/bin/rest.exe/v2/location.name" + "?input=" + name + "&format=json";
    http.open("GET", url, true);
    http.setRequestHeader("Authorization","Bearer " + token);

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var jsonResponse = JSON.parse(http.responseText);
            var results =jsonResponse.LocationList.StopLocation;

            var listArray = [];
            for(var i=0; i < 4; i++){
                if(i < results.length){
                    listArray.push(results[i].name);
                }
            }
            callback(listArray);

        } else if(http.status == 401){
            getToken(monitorRequest.device_id, tokenReady);
        }
    };
    http.send(null);

}

function setStopID(name, from){
    var http = new XMLHttpRequest();
    var url = "https://api.vasttrafik.se/bin/rest.exe/v2/location.name" + "?input=" + name + "&format=json";
    http.open("GET", url, true);
    http.setRequestHeader("Authorization","Bearer " + token);

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var jsonResponse = JSON.parse(http.responseText);
            var result =jsonResponse.LocationList.StopLocation[0];
            if(from){
                monitorRequest.from_id = result.id;
            } else {
                monitorRequest.to_id = result.id;
            }

        } else if(http.status == 401){
            getToken(currentID, tokenReady);
        }
    };
    http.send(null);
}

function tokenReady(){
}

function btnListener(event){
    if(event.keyCode == 13){
        generateMonitor();
    }
}

function generateMonitor() {
    if(monitorRequest.device_id.length > 1){
        if(monitorRequest.from_id.length > 1){
                window.location.href = "monitor.html?from=" + monitorRequest.from_id + "&to=" + monitorRequest.to_id + "&device=" + monitorRequest.device_id;
        } else {
            document.getElementById("errorPara").innerHTML = "Välj en hållplats att visa bussmonitor för.";
            document.getElementById("fromTextField").focus();
        }
    } else {
        document.getElementById("errorPara").innerHTML = "Error när unikt ID skulle genereras. Prova att ladda om sidan. <br> Om det inte hjälper kanske du har en gammal webläsare?";
    }
}

function main(){

    monitorRequest = {
        from_id: "",
        to_id: "",
        device_id: ""
    };

    var currentID = (Math.random()*100000) | 0;
    monitorRequest.device_id = String(currentID);
    getToken(currentID, tokenReady);

    // initialize auto complete
    var from_autoComplete = new autoComplete({
        selector: document.getElementById("fromTextField"),
        source: function(term,response){
            getBestMatchingStops(term, response);
        },
        onSelect: function(event, term, item){
            setStopID(term, true);
        }
    });

    var to_autoComplete = new autoComplete({
        selector: document.getElementById("toTextField"),
        source: function(term,response){
            getBestMatchingStops(term, response);
        },
        onSelect: function(event, term, item){
            setStopID(term, false);
        }

    });

    var btnContinue = document.getElementById("btnContinue");
    btnContinue.addEventListener("keypress", btnListener);

}



