let https = require('https');
let querystring = require('querystring');
let _ = require('lodash');
let dbase =  require('./dbase')
var moment = require('moment');
var setting = require('../config/settings.json')
var searchPoll = require('./MozioPoll')

//var xml2js = require('xml2js');
//http://localhost:5000/?id=123&Adults=2&Child=0&Infant=0&FromDate=20171215&ToDate=20171230&FromTime=1200&ToTime=1200&FromLatLong=51.4703,-0.45342&ToLatLong=50.8197675,%20-1.0879769000000579
module.exports = function getdata(data,callback){

    var tf = moment();    
    console.log("Mozio code Fired :" + tf )
    var tt=moment();
    var tc_apiKey       = "WIbKkK6MWjbGFjmy"
    var tc_secretKey    = "ac6G7isG0R98SeyE"    
        var ToDate, People=0
        var CurID = (data.currencyid==='' || data.currencyid===undefined ? 'GBP' : data.currencyid)
        var SearchID

        // Calculate People
        People= data.Adults==''||data.Adults==undefined ? parseInt(People)+0 : parseInt(People)+parseInt(data.Adults);
        People= data.Children==''||data.Children==undefined ? People=(parseInt(People)+0) : People=parseInt(People)+parseInt(data.Children);
        People= data.Infants==''||data.Infants==undefined ? People=(parseInt(People)+0) : People=parseInt(People)+parseInt(data.Infants);
        // End of calculate people

        //From Date Calculation
        if (data.FromDate=='' || data.FromDate==undefined){FromDate=''}
        else{FromDate=data.FromDate; FromDate= data.FromDate.substring(0, 4)+'-'+data.FromDate.substring(4, 6)+'-'+data.FromDate.substring(6, 8)}
        // End of From Date 

        //To Date Calculation
        if (data.ToDate=='' || data.ToDate==undefined){ToDate=''}
        else{ToDate=data.ToDate; ToDate= data.ToDate.substring(0, 4)+'-'+data.ToDate.substring(4, 6)+'-'+data.ToDate.substring(6, 8)}
        // End of todate 

        //From Time Calculation
        if (data.FromTime=='' || data.FromTime==undefined){FromTime=''}
        else{FromTime=data.FromTime; FromTime= data.FromTime.substring(0, 2)+':'+data.FromTime.slice(-2);}
        // End of FromTime    

        //To Time Calculation
        var ToTime="";
        if (data.ToTime=='' || data.ToTime==undefined){ToTime=''}
        else{ToTime=data.ToTime; ToTime= data.ToTime.substring(0, 2) +':'+ data.ToTime.slice(-2);}

        // End of ToTime    

        FromDate=FromDate +'T'+FromTime
        ToDate = ToDate!=='' || ToDate!==undefined ? ToDate=ToDate+'T'+ToTime : ''
        
        var  transferFlag, mode;

        if (ToDate==='' || ToDate===undefined)
          {
            transferFlag=1;
            mode="one_way"
          }
        else
          {
            transferFlag=3;
            mode="round_trip"
          }

        var tc_DataToSend=querystring.stringify({
          "start_lat": data.FromLat,
          "start_lng": data.FromLong,
          "end_lat": data.ToLat,
          "end_lng": data.ToLong,
          "mode": mode,
          "pickup_datetime": FromDate,
          "return_pickup_datetime": ToDate,
          "num_passengers": People,
          "currency": CurID
        })
 
        //console.log (tc_DataToSend)
        // request option
        var options = {
          host: 'api-testing.mozio.com',
          port: 443,
          method: 'POST',
          path: '/v2/search/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(tc_DataToSend),
            'API-KEY':'947d9ddec286468cbb3593a857155838'
          }
        };
        
        // request object
        var req = https.request(options, function (res) {
          var result = '';
          var mozresult =''
          var interval;
          res.on('data', function (chunk) {
            result += chunk;
          });
          res.on('end', function () {
                var boolCallbackCalled = false;

                var arg2 = (MozioReturnData)=>{ // ARG 2 FUNCTION
                    try{
                        mozresult=mozresult.concat(JSON.parse(MozioReturnData))
                        var mozresultJason = JSON.parse(MozioReturnData);
                        console.log("milli sec passed : " + tt.diff(tf,'milliseconds',true) )
                        if ((mozresultJason.more_coming==false ||   tt.diff(tf,'milliseconds',true) >= setting.timeout || mozresultJason.non_field_errors!= undefined) && !boolCallbackCalled){
                          try{
                              callback('More comming : '+ mozresult);
                              dbase(MozioReturnData,
                                data.sessionid,
                                transferFlag,
                                (err,stat)=>{
                              }); // INSERT INTO DATABASE                        
                              clearInterval(interval);
                              boolCallbackCalled=true;
                              console.info('More comming : '+ mozresultJason.more_coming)
                              return; 
                          }
                          catch(err){
                            console.error("Mozio Error 1" + err)
                            return;
                          }
                        }  
                        else{
                          //console.log("Mozio cALLING db")
                          tt=moment();
                            dbase(MozioReturnData,
                              data.sessionid,
                              transferFlag,
                              (err,stat)=>{
                            }); // INSERT INTO DATABASE
                        }                    
                    }
                    catch(err){
                      console.error("Json error :" + MozioReturnData )
                      callback('More comming : '+ mozresult);
                      return;
                    }
                }

                try{ // Check if JSON is valid
                    var arg1 = JSON.parse(result).search_id;
                    if(arg1==undefined){// if no searchid then ignore and return
                      console.log("Jason error :" + result )
                      return callback('Mozio No search id : '+ JSON.parse(result))
                    }
                    else{
                      interval = setInterval( // then subsiguent calls with timer
                        ()=>{return searchPoll(arg1,arg2)}, 
                        1500
                      );   
                    }                 
                  } 
                catch(err){
                  
                  console.log("Jason error :" + result )
                  return callback('Mozio invalid Json object : '+ result)
                }                


          });
          res.on('error', (err)=> {
            console.log(err);
          })
        });
        
        // req error
        req.on('error', (err)=> {
          console.log(`Mozio Error from here: ${err}`);
        });

        req.setTimeout(setting.timeout, ()=>{ // 3 SECONDS ID THE TIMEOUT PERIOD
          req.abort();
          callback('Timeout ');
        });        
        //send request witht the postData form
        req.write(tc_DataToSend);
        req.end();

}


