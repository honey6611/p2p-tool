// Include the async package
// Make sure you add "async" to your package.json
var async = require("async");
var conn = require("./config/databaseConnection");
var TaxiCode  =  require("./taxicode/index");
var p2papi  =  require("./p2papi/index");
var Mozio  =  require("./mozio/index"); 
//const settings =  require('./config/settings')

module.exports=function AsyncCall(request,FullData){
    //read settings file
    var fs = require("fs");
    var content = fs.readFileSync("./config/settings.json");
    const settings = JSON.parse(content)
    //With Array
    //console.log("From Aync: " +request.id)
    var stack = [];
    var retval;
    var test;
    
    if(settings.provider.mozio===1 && request.Mozio!="-1"){
      // Mozio api
      var functionThree = function(callback) {  
        Mozio(request,function(data){
          callback(null, data);
        })
      }
      stack.push(functionThree); 
    }    
       
    if(settings.provider.taxicode===1 && request.TaxiCode!="-1"){
      // taxi code
      var functionOne = function(callback) { 
          TaxiCode(request,function(data){
          callback(null, data);
          })  
      }
      stack.push(functionOne); 
    }

    if(settings.provider.p2p===1 && request.P2P!="-1"){
      // P2P api
      var functionTwo = function(callback) {  
        p2papi(request,function(data){
          callback(null, data);
        })
      }
      stack.push(functionTwo);  
    }


    // var functiontest = function(callback) {  
    //   testsql(request,function(data){
    //     callback(null, data);
    //   })
    // }  
    // stack.push(functiontest);
    async.parallel(stack, function(err, result) {  
         //console.log('Async parallel with array', result);
         if(err){
           console.log("Async Error: " + err)
         }
         else{
           FullData(result)
          }
         
    }); 


}
