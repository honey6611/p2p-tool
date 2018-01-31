const sql = require('mssql')
var sqlConn = sql.globalConnection;
//const config = require('../config/databaseConnection')
let _ = require('lodash');
let moment = require('moment')

module.exports = async function insert(result,sessionid,tflag,callback){
    var company_name,company_logo,SearchTimeStamp
    var PriceID,Vehiclename,VehicleImage,passenger,luggage_big,luggage_small,NumUnits,id,vehicleclass,Transferflag,sessionid,OccupancyFrom
    var CurID,UnitID,Min_Stops,Max_Stops,Transferflag, distance,duration
    var json = JSON.parse(result); 
    var table
    var CurID = (result.currencyid==='' || result.currencyid===undefined ? 'GBP' : result.currencyid)
    // try{await sql.close(); }                    
    // catch(err){console.log("connection close error :" + err)}    
    try {
    //const pool = await sql.connect(config)
    var request = new sql.Request(sqlConn);
        distance=json.journey.distance;
        duration=json.journey.duration;
        duration = isNaN(duration)?'': Math.round(duration/60)
        _.forOwn(json,  function(value, key) {
            //console.log(key+':' + value)
            if(key=="quotes"){
            _.forOwn(value,  function(value1, key1) { // each quote ex: 1A0E62FBDAEAB41F3A60969DE125C153

                //console.log(key1+':' + value1)
                company_name=value1.company_name;
                company_logo=value1.company_logo.url;
                company_logo=company_logo==undefined ? '' : company_logo
                //console.log('company_logo :' + company_logo)
                _.forOwn(value1,  function(value2, key2) {
                    //console.log(key2+':' + value2)
                    if(key2=="vehicles"){ // inside vehicles object
                    //console.log(key2+':' + value2)
                    _.forOwn(value2,  function(value3, key3) {
                        PriceID=value3.id;
                        Price= value3.price;
                        passenger= value3.passengers;
                        Vehiclename= value3.name;
                        Pricing=0; UnitID=0;Min_Stops=0;Max_Stops=0;
                        luggage_big= value3.luggage_big;
                        luggage_small= value3.luggage_small;
                        count= value3.count;
                        OccupancyFrom=1;                            
                        vehicleclass= value3.class;
                        VehicleImage= value3.image;
                        NumUnits= value3.count;
                        OccupancyTo=passenger;
                        sessionid= sessionid
                        
                        SearchTimeStamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                        Transferflag=tflag
                        if (Transferflag===1){
                        TotalCostPriceSingle=Price;
                        TotalCostPriceReturn=0;
                        }
                        else{
                            TotalCostPriceSingle=0;
                            TotalCostPriceReturn=Price;
                        }

                        var InserQuery=`INSERT INTO APISearchData (sessionid,PriceID,SearchTimeStamp,Pricing,Distance,duration,UnitID,Vehicle,OccupancyFrom,OccupancyTo,CurID,TotalCostPriceSingle,TotalCostPriceReturn,Min_Stops,Max_Stops,NumUnits,company_logo,Transferflag,VehicleImage,company,TransferType)
                        values ('${sessionid}','${PriceID}','${SearchTimeStamp}','${Pricing}','${distance}','${duration}','${UnitID}','${Vehiclename}','${OccupancyFrom}','${OccupancyTo}','${CurID}','${TotalCostPriceSingle}','${TotalCostPriceReturn}','${Min_Stops}','${Max_Stops}','${NumUnits}','${company_logo}','${Transferflag}','${VehicleImage}','${company_name}',1)`
                        //console.log(InserQuery)
                        //let result1 = sql.request()
                        let result1 = sql.query `INSERT INTO APISearchData (sessionid,PriceID,SearchTimeStamp,Pricing,Distance,duration,UnitID,Vehicle,OccupancyFrom,OccupancyTo,CurID,TotalCostPriceSingle,TotalCostPriceReturn,Min_Stops,Max_Stops,NumUnits,company_logo,Transferflag,VehicleImage,company,TransferType)
                        values (${sessionid},${PriceID},getdate(),${Pricing},${distance},${duration},${UnitID},${Vehiclename},${OccupancyFrom},${OccupancyTo},${CurID},${TotalCostPriceSingle},${TotalCostPriceReturn},${Min_Stops},${Max_Stops},${NumUnits},${company_logo},${Transferflag},${VehicleImage},${company_name},1)`
                    })
                    }   
                })
            })
            } // if(key=="quotes")
        }); 
        return callback('','Success')
    }
    catch(err){
        console.error("catch err :" + err);
        return callback('','Success')
    }

    //process.on('unhandledRejection', (reason, p) => {
    //    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        // application specific logging, throwing an error, or other logic here
    //  });
}