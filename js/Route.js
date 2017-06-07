/**
 * Created by Kim on 2017-04-19.
 */
function Route(name, endStation, bgColor, fgColor) {
    this.name = name;
    this.endStation = endStation;
    this.next;
    this.nextNext;
    this.bgColor = bgColor;
    this.fgColor = fgColor;

    this.equals = function(r){
        return (r.name == this.name) && (r.endStation == this.endStation);
    };

    function timeDiffToString(busTime, busDate, serverDate, serverTime) {

        // Format date/times
        var b = busDate.split("-");
        b = b.concat(busTime.split(":"));
        var s = serverDate.split("-");
        s = s.concat(serverTime.split(":"));

        var bDate = new Date(b[0],(b[1]|0)-1,b[2],b[3],b[4],0,0);
        var sDate = new Date(s[0],(s[1]|0)-1,s[2],s[3],s[4],0,0);


        //Calculate diff
        var minDiff = (bDate.getTime() - sDate.getTime())/(60000);

        if(minDiff > 59){
            var hdiff = minDiff/60 | 0;
            minDiff = minDiff % 60;
            return "" + hdiff + "h " + minDiff + "min";

        }

        return "" + minDiff;
    }

    this.addNext = function (busTime, busDate, serverDate, serverTime) {
        if(!this.next){
            this.next = timeDiffToString(busTime, busDate, serverDate, serverTime);
        } else if(!this.nextNext){
            this.nextNext = timeDiffToString(busTime, busDate, serverDate, serverTime);
        }
    };

    this.drawName = function () {
        var fontSize = 2;
        if(this.name.length > 2){
            if(this.name.length === 3){
                fontSize = 1.6;
            } else {
                fontSize = 1.2;
            }
        }
        var styleString = 'background-color:' + this.fgColor + 
                            '; color:' + (this.bgColor) +
                            '; font-size: '+ fontSize +'em;';
        return '<div class="bussNumber" style="' + styleString + '">' + this.name + '</div>';
    };
    
    this.drawEndStation = function () {
        return '<div class="arrivalTime">' + this.endStation.split(",")[0] + '</div>';
    };

    this.drawNext = function(){
        if(this.next) {
            if(this.next == 0 || this.next == -1) {
                return '<div class="arrivalTime"> Nu </div>';
            }else{
                return '<div class="arrivalTime">' + this.next + '</div>';
            }
        }
        return '<div class="arrivalTime"></div>';
    };

    this.drawNextNext = function(){
        if(this.nextNext) {
            if(this.nextNext == 0) {
                return '<div class="arrivalTime"> Nu </div>';
            }else{
                return '<div class="arrivalTime">' + this.nextNext + '</div>';
            }
        }
        return '<div class="arrivalTime"></div>';
    };
}