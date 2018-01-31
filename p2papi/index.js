const sql = require('mssql')
var moment = require('moment');
var sqlConn = sql.globalConnection;
    module.exports = async function p2p(data,callback) {
        console.log("P2P code Fired :" + moment() )
      try {
        if (data.ToDate=='' || data.ToDate==undefined){
            ToDate='';
            ToTime='';
            transferFlag=1
        }
        else{
            ToDate=data.ToDate;
            ToTime=data.ToTime;
            transferFlag=3
        }

        var request = new sql.Request(sqlConn);
        const result = await sql.query `exec Insert_APISearch
        @SessionID=${data.sessionid},
        @arrivaldate=${data.FromDate},
        @departuredate=${ToDate},
        @Lang='EN',
        @CodeFrom=${data.CodeFrom},    
        @CodeTo=${data.CodeTo},    
        @Adults=${data.Adults},    
        @Children=${data.Children},    
        @Infants=${data.Infants},    
        @AgentID=${data.AgentID},
        @UnitID=0,    
        @PriceID=0,
        @ArrTime=${data.FromTime},
        @RetTime=${ToTime},
        @TransferType=0`

        sql.on('error', err => {
            // ... error handler
            console.error("P2P SQL err :"+err)
            return;
        })

        callback(data);   
        //console.dir(result1)  
        //sql.close;   
        //if (pool) pool.close();  

        
      } catch (err) {
          // ... error checks
          console.error('P2p Store proc error : '+err);
          return;
      }
      finally{
        console.log( "P2P End"+ Date.now()); 
        return;
      }
  }
 
  //sql.on('error', err => {
      // ... error handler
  //    console.log(err);
  //})

/*}*/


