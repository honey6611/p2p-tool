const sql = require('mssql')
var sqlConn = sql.globalConnection;
//const config = require('../config/databaseConnection')
let _ = require('lodash');
let moment = require('moment')
let querystring = require('querystring');
var fs = require('fs');

module.exports = async function insert(result,sessionid,tflag,callback){

    var company_name,company_logo,SearchTimeStamp
    var PriceID,Vehiclename,VehicleImage,passenger,luggage_big,luggage_small,NumUnits,id,vehicleclass,Transferflag,sessionid,OccupancyFrom
    var CurID,UnitID,Min_Stops,Max_Stops,Transferflag,company_sessionid,company_searchid
    var json = JSON.parse(result); 
    var table
    // try{await sql.close(); }                    
    // catch(err){console.log("connection close error :" + err)}    
   
    try {
        if(json.results[0]!==undefined ){
            debugger;
            PriceID=0;
            sessionid= sessionid;
            CurID=json.currency_info.code;
            passenger= json.num_passengers;
            OccupancyTo=passenger;
            company_searchid = json.search_id;
            Pricing=0; UnitID=0;Min_Stops=0;Max_Stops=0;
            Distance=0;
            SearchTimeStamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            _.forOwn(json.results,  function(value, key){
                //console.log(json.results[key].result_id)
                company_sessionid=json.results[key].result_id;
                Price= json.results[key].total_price.total_price.value;
                Vehiclename= json.results[key].steps[0].details.vehicle.vehicle_type.name;
                count= json.results[key].steps[0].details.vehicle.num_vehicles;
                OccupancyFrom=json.results[key].steps[0].details.vehicle.max_passengers;                            
                vehicleclass= json.results[key].steps[0].details.description;
                VehicleImage= json.results[key].steps[0].details.vehicle.image;
                NumUnits= json.results[key].steps[0].details.vehicle.num_vehicles;
                company_name=json.results[key].steps[0].details.provider.name;
                company_logo=json.results[key].steps[0].details.provider.logo_url;

                Transferflag=tflag
                if (Transferflag===1){
                    TotalCostPriceSingle=Price;
                    TotalCostPriceReturn=0;
                }
                else{
                    TotalCostPriceSingle=0;
                    TotalCostPriceReturn=Price;
                }
                
                 var sqlQuery=`INSERT INTO APISearchData (sessionid,PriceID,SearchTimeStamp,Pricing,Distance,UnitID,Vehicle,OccupancyFrom,OccupancyTo,CurID,TotalCostPriceSingle,TotalCostPriceReturn,Min_Stops,Max_Stops,NumUnits,company_logo,Transferflag,VehicleImage,company,TransferType,company_sessionid,company_searchid)
                 values ('${sessionid}','${PriceID}',getdate(),'${Pricing}','${Distance}','${UnitID}','${Vehiclename}','${OccupancyFrom}','${OccupancyTo}','${CurID}','${TotalCostPriceSingle}','${TotalCostPriceReturn}','${Min_Stops}','${Max_Stops}','${NumUnits}','${company_logo}','${Transferflag}','${VehicleImage}','${company_name}',1,'${company_sessionid}','${company_searchid}')`
                 //let result1 = pool.request()
                 var request = new sql.Request(sqlConn);
                 let result = sql.query `INSERT INTO APISearchData (sessionid,PriceID,SearchTimeStamp,Pricing,Distance,UnitID,Vehicle,OccupancyFrom,OccupancyTo,CurID,TotalCostPriceSingle,TotalCostPriceReturn,Min_Stops,Max_Stops,NumUnits,company_logo,Transferflag,VehicleImage,company,TransferType,company_sessionid,company_searchid)
                 values (${sessionid},${PriceID},getdate(),${Pricing},${Distance},${UnitID},${Vehiclename},${OccupancyFrom},${OccupancyTo},${CurID},${TotalCostPriceSingle},${TotalCostPriceReturn},${Min_Stops},${Max_Stops},${NumUnits},${company_logo},${Transferflag},${VehicleImage},${company_name},1,${company_sessionid},${company_searchid})`                   

            })
    
            callback('','Success')
            return;
        }


    }
    catch(err){
        console.error("catch err :" + err);
        return callback ("catch err :" + err,'');
    }

    process.on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
        return;
      });
}