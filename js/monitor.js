/**
 * Created by Kim on 2017-04-19.
 */

var monitor;
var tokenTime;


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//Retrieve HTML Query parameters
// and assign to the monitor object.
function parseURLinputs(){
    var from = getParameterByName("from");
    var to = getParameterByName("to");
    var device = getParameterByName("device");
        if(!from){
            alert("En hållplats måste väljas");
            window.location.replace("index.html");
        }
        monitor.from = from;
        monitor.to = to;

        if(device) {
            monitor.device = device;
        } else {
            monitor.device = "" + ((Math.random()*100000) | 0);
        }
}

function timePadding(i){
        if (i < 10) {
            i = "0" + i;
        }
        return i;
}

function requestInformation(date, time, callback) {

    var http = new XMLHttpRequest();
    var url = "https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard?id=" + monitor.from +
        ((monitor.to) && (monitor.to.length > 1) ? "&direction=" + monitor.to : "") +
        "&date=" + date + "&time=" + time + "&format=json";
    http.open("GET", url, true);
    http.setRequestHeader("Authorization","Bearer " + token);

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if (http.status == 200) {
                var response = JSON.parse(http.responseText);
                if (response && response.DepartureBoard && response.DepartureBoard.Departure) {
                    var routes = [];
                    var busStop = response.DepartureBoard.Departure[0].stop.split(',')[0];
                    var serverTime = response.DepartureBoard.servertime;
                    var serverDate = response.DepartureBoard.serverdate;

                    for (var i = 0; i < response.DepartureBoard.Departure.length; i++) {
                        var bus = response.DepartureBoard.Departure[i];
                        var busDate = (bus.rtDate ? bus.rtDate : bus.date);
                        var busTime = (bus.rtTime ? bus.rtTime : bus.time);

                        var tempRoute = new Route(bus.sname, bus.direction, bus.bgColor, bus.fgColor);
                        var indexExisting = routeIsMember(tempRoute, routes);
                        if (indexExisting == -1) {
                            tempRoute.addNext(busTime, busDate, serverDate, serverTime);
                            routes.push(tempRoute);
                        } else {
                            routes[indexExisting].addNext(busTime, busDate, serverDate, serverTime);
                        }
                    }
                    callback(routes, busStop, serverTime);
                } else if (response && response.DepartureBoard && response.DepartureBoard.errorText) {
                    document.getElementById("busStop").innerHTML = response.DepartureBoard.errorText + '</br>' +
                        "Most likely the selected bus stops are not directly connected";
                }
            } else if (http.status !== 200) {
                getToken(monitor.device, tokenUpdated);
            }
        }
    };

    http.send();
}

/*
* requestServerTime is a workaround to ask for the timetable for the current server time.
* This is done since the user might be on a different time zone or have faulty time-settings on their device and thus
* get faulty results. There is no scenario where this web app should be used to find the departure board of a different
* time.
 */
function requestServerTime(reqInfo){
    var d = new Date();
    var date = "" + d.getFullYear() + "-" + timePadding(d.getMonth()+1) +  "-" + timePadding(d.getDate());
    var time = "" + timePadding(d.getHours()) + "%3A" + timePadding(d.getMinutes());  //HH:MM

    var http = new XMLHttpRequest();
    var url = "timeGenerator.php";
    http.open("GET", url, true);

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            var result = http.responseText.split(",");
            date = result[0];
            time = result[1].split(':')[0] + "%3A" + result[1].split(':')[1];
            reqInfo(date,time, drawRoutes);
        }
    };
    http.send();
}

function drawRoutes(routes, busStop, serverTime){
    var loader = document.getElementById("loader");
    if(loader){
        var container = document.getElementById("container");
        container.removeChild(loader);
    }
    document.getElementById("busStop").innerHTML = busStop;
    document.getElementById("serverTime").innerHTML = serverTime;

    var innerTableHtml = "<tr><th>Linje</th><th>Destination</th><th>Avgår om (min)</th><th>Därefter</th></tr>";
    for(var i = 0; i < routes.length; i++){
        innerTableHtml += '<tr class="row' + (i%2) +  '">';
        innerTableHtml += '<td>' + routes[i].drawName() + '</td>';
        innerTableHtml += '<td>' + routes[i].drawEndStation() + '</td>';
        innerTableHtml += '<td>' + routes[i].drawNext() + '</td>';
        innerTableHtml += '<td>' + routes[i].drawNextNext() + '</td>';
        innerTableHtml += '</tr>';
    }
    document.getElementById("table").innerHTML = innerTableHtml;
}

function tokenReady() {
    update();
    setInterval(function(){
        update();
    }, 10000);
}

function tokenUpdated() {
}


function setup() {
    monitor = {
        from: "",
        to: "",
        device: ""
    };
    parseURLinputs();
    getToken(monitor.device, tokenReady);
}

function update() {
    var d = new Date();
    var date = "" + d.getFullYear() + "-" + timePadding(d.getMonth()+1) +  "-" + timePadding(d.getDate());
    var time = "" + timePadding(d.getHours()) + "%3A" + timePadding(d.getMinutes());  //HH:MM
    requestServerTime(requestInformation);
    //requestInformation(date, time, drawRoutes);
}

function routeIsMember(route, routes) {
    for(var i=0; i < routes.length; i++){
        if(route.equals(routes[i])){
            return i;
        }
    }
    return -1;
}
