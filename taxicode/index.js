let https = require('https');
let querystring = require('querystring');
let _ = require('lodash');
var moment = require('moment');
let dbase =  require('./dbase')
var setting = require('../config/settings.json')
//var xml2js = require('xml2js');
//http://localhost:5000/?id=123&Adults=2&Child=0&Infant=0&FromDate=20171215&ToDate=20171230&FromTime=1200&ToTime=1200&FromLatLong=51.4703,-0.45342&ToLatLong=50.8197675,%20-1.0879769000000579
module.exports = function getdata(data,callback){

    var tc_apiKey       = "WIbKkK6MWjbGFjmy"
    var tc_secretKey    = "ac6G7isG0R98SeyE"    
    var tf = moment();    
    console.log("taxi code Fired :" + tf )
    var tt=moment();
        var ToDate, People=0
        var FromLatLong,ToLatLong
        FromLatLong =data.FromLat+","+data.FromLong
        ToLatLong =data.ToLat+","+data.ToLong

        // Calculate People
        if (data.Adults==''||data.Adults==undefined){People=(parseInt(People)+0)}
        else{People=parseInt(People)+parseInt(data.Adults)}
        if (data.Children==''||data.Children==undefined){People=(parseInt(People)+0)}
        else{People=parseInt(People)+parseInt(data.Children)}
        if (data.Infants==''||data.Infants==undefined){People=(parseInt(People)+0)}
        else{People=parseInt(People)+parseInt(data.Infants)}        
        // End of calculate people

        //From Date Calculation
        if (data.FromDate=='' || data.FromDate==undefined){FromDate=''}
        else{FromDate=data.FromDate; FromDate= data.FromDate.substring(0, 4)+'/'+data.FromDate.substring(4, 6)+'/'+data.FromDate.substring(6, 8)}
        // End of From Date 

        //To Date Calculation
        if (data.ToDate=='' || data.ToDate==undefined){ToDate=''}
        else{ToDate=data.ToDate; ToDate= data.ToDate.substring(0, 4)+'/'+data.ToDate.substring(4, 6)+'/'+data.ToDate.substring(6, 8)}
        // End of todate 

        //From Time Calculation
        if (data.FromTime=='' || data.FromTime==undefined){FromTime=''}
        else{FromTime=data.FromTime; FromTime= data.FromTime.substring(0, 2)+':'+data.FromTime.slice(-2);}
        // End of FromTime    

        //To Time Calculation
        var ToTime="";
        if (data.ToTime=='' || data.ToTime==undefined){ToTime=''}
        else{ToTime=data.ToTime; ToTime= data.FromTime.substring(0, 2) +':'+ data.ToTime.slice(-2);}

        // End of ToTime    

        FromDate=FromDate +' '+FromTime
        //FromDate="2017/10/12"
        FromDate = new Date(FromDate)
        //console.log("GetTime :" +FromDate)
        FromDate = FromDate.getTime()/1000|0
        
        if (ToDate!=='' || ToDate!==undefined)
        {
          ToDate=ToDate+' '+ToTime;
          ToDate = new Date(ToDate);
          ToDate = ToDate.getTime()/1000|0;
        }
        
        var  transferFlag;
        if (ToDate==='' || ToDate===undefined){transferFlag=1}
        else{transferFlag=3}

        var tc_DataToSend = `pickup=${FromLatLong}&destination=${ToLatLong}&date=${FromDate}&return=${ToDate}&people=${People}&key=${tc_apiKey}`      

        var options = {
          host: 'api.taxicode.com',
          port: 443,
          timeout: 4000,
          method: 'POST',
          path: '/booking/quote/?format=json',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': tc_DataToSend.length
          }
        };
        
        // request object
        var req = https.request(options, function (res) {
          var result = '';
          res.on('data', function (chunk) {
            result += chunk;
          });
          res.on('end', function () {
            if(JSON.parse(result).status=='OK'){
              //callback(JSON.parse(result).quotes);     // Return Control to async
              dbase(result,data.sessionid,transferFlag,function(err,stat){
                  tt=moment();
                  console.log("Taxi Code End : " + tt.diff(tf,'milliseconds',true) )
                  //console.info( ""+ Date.now())
                  return callback(JSON.parse(result).quotes);     // Return Control to async
                  //return;
              }); // INSERT INTO DATABASE

            }
            else{
              console.info( "TaxiCode Error Response :"+ JSON.stringify(result))
              return callback ('Error',JSON.parse(result))
            }
          });
        });
        
        // req error
        req.on('error', function (err) {
          res.destroy();
          this.abort();
          console.error("Error from here:" +err);
          return callback('Error ' + err);
        });

        req.setTimeout(setting.timeout, function(){ // 3 SECONDS ID THE TIMEOUT PERIOD
          res.destroy();
          req.abort();
          return  callback('Timeout','');
          
        });        
        //send request witht the postData form
        req.write(tc_DataToSend);
        req.end();
}


