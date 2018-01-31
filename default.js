require('events').EventEmitter.defaultMaxListeners = 10000;
var express = require('express');
var async = require('./async')
var app = express();
var moment = require('moment');
// Include the cluster module
var cluster = require('cluster');
let _ = require('lodash');
var prams, IIS = false

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var js2xmlparser = require("js2xmlparser");

//var timeStampInMs = document.performance && document.performance.now && document.performance.timing && document.performance.timing.navigationStart ? window.performance.now() + document.performance.timing.navigationStart : Date.now();
//http://localhost:2000/?sessionid=112323&AgentID=60042&CodeFrom=ALC&CodeTo=BEN&Adults=2&Children=0&Infants=0&FromDate=20180415&ToDate=20180428&FromTime=1400&ToTime=1200&FromLat=51.4703&FromLong=-0.45342&ToLat=50.8197675&ToLong=-1.0879769000000579&currencyid=GBP

const port = 3000;
var js2xmlparser_options = {
    declaration: {
        encoding: "UTF-8",
        version: "1.0"
    }
}
// app.use('/', function (req, res, next) {
//     console.log('Request Type:', req.method)
//     next()
// })

if (cluster.isMaster) {
    // Code to run if we're in the master process
 
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }   
}
else{
    // app.get('/', function (req, res) {
    //     res.setHeader('Content-Type', 'text/plain');
    //     res.send("Root/")
    // })


    // Code to run if we're in a worker process
    app.get('/search',[
        check('AgentID', 'AgentID cannot be empty and must be atleast 4 characters long').isLength({ min: 4 }).isNumeric(),
        check('sessionid', 'sessionid cannot be empty and must be atleast 4 characters long').isLength({ min: 4 }),
        check('CodeFrom', 'CodeFrom cannot be empty and must be 3 characters long').isLength({ min: 3, max: 3 }),
        check('CodeTo', 'CodeTo cannot be empty and must be 3 characters long').isLength({ min: 3, max: 3 }),
        check('Adults', 'Adults cannot be empty and needs to be between 0 - 50').isLength({ min: 1, max: 50 }).isNumeric(),
        check('Children', 'Children minimum value 1 and max 50').optional({ checkFalsy: true }).isInt(),
        check('Infant', 'Infants minimum value 1 and max 50').optional({ checkFalsy: true }).isInt(),        
        check('FromLat', 'FromLat is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('FromLong', 'FromLong is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('ToLat', 'ToLat is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('ToLong', 'ToLong is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('FromDate', 'FromDate is invalid or empty').isLength({ min: 8, max: 8 }).isDecimal(),
        check('ToDate', 'ToDate is invalid or empty').optional({ checkFalsy: true }).isLength({ min: 8, max: 8 }).isDecimal(),        
        check('FromTime', 'FromTime is invalid or empty HHMM').isLength({ min: 4, max: 4 }).isDecimal(),   
        check('ToTime', 'ToTime is invalid or empty HHMM').optional({ checkFalsy: true }).isLength({ min: 4, max: 4 }).isDecimal(),   
        check('currencyid', 'currencyid is invalid or empty').isLength({ min: 3, max: 3 }).isAlpha()           
    ], function (req, res, next) {
        
        res.setHeader('Content-Type', 'text/xml');
            // normal processing here
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.end(js2xmlparser.parse("Errors", errors.mapped(),js2xmlparser_options));
            }
            else{
                var tf = moment();
                prams = req.query;
                async(prams,function(data){
                    tt=moment();
                    var output =  tt.diff(tf,'seconds',true);
                    console.log("Process completed in : " + output + " sec")
                    //res.send("Time : " + output +"Sec")
                    res.end(`<?xml version='1.0' encoding='UTF-8'?><TCOM>
                    <ResponseTime>${output}</ResponseTime>
                    <result>
                        <sessionid>${req.query.sessionid}</sessionid>
                    </result></TCOM>`)
                }) 
            }           
    })

    app.post('/search',[
        check('AgentID', 'AgentID cannot be empty and must be atleast 4 characters long').isLength({ min: 4 }).isNumeric(),
        check('sessionid', 'sessionid cannot be empty and must be atleast 4 characters long').isLength({ min: 4 }),
        check('CodeFrom', 'CodeFrom cannot be empty and must be 3 characters long').isLength({ min: 3, max: 3 }),
        check('CodeTo', 'CodeTo cannot be empty and must be 3 characters long').isLength({ min: 3, max: 3 }),
        check('Adults', 'Adults cannot be empty and needs to be between 0 - 50').isLength({ min: 1, max: 50 }).isNumeric(),
        check('Children', 'Children minimum value 1 and max 50').optional({ checkFalsy: true }).isInt(),
        check('Infants', 'Infants minimum value 1 and max 50').optional({ checkFalsy: true }).isInt(),        
        check('FromLat', 'FromLat is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('FromLong', 'FromLong is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('ToLat', 'ToLat is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('ToLong', 'ToLong is invalid or empty').isLength({ min: 1, max: 50 }).isFloat(),
        check('FromDate', 'FromDate is invalid or empty').isLength({ min: 8, max: 8 }).isDecimal(),
        check('ToDate', 'ToDate is invalid or empty').optional({ checkFalsy: true }).isLength({ min: 8, max: 8 }).isDecimal(),        
        check('FromTime', 'FromTime is invalid or empty HHMM').isLength({ min: 4, max: 4 }).isDecimal(),   
        check('ToTime', 'ToTime is invalid or empty HHMM').optional({ checkFalsy: true }).isLength({ min: 4, max: 4 }).isDecimal(),   
        check('currencyid', 'currencyid is invalid or empty').isLength({ min: 3, max: 3 }).isAlpha()           
    ], function (req, res) {
            res.setHeader('Content-Type', 'text/xml');
            // normal processing here
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.end(js2xmlparser.parse("Errors", errors.mapped(),js2xmlparser_options));
            }
            else{            
               var tf = moment();
               prams = req.body;
                async(prams,function(data){
                    tt=moment();
                    var output =  tt.diff(tf,'seconds',true);
                    console.log(" Process completed in : " + output + " sec")
                    //res.writeHead(200, {'Content-Type': 'text/html'});
                    //res.end("Time : " + output +"Sec")
                    res.end(`<?xml version='1.0' encoding='UTF-8'?><TCOM>
                    <ResponseTime>${output}</ResponseTime>
                    <result>
                        <sessionid>${req.body.sessionid}</sessionid>
                    </result></TCOM>`)
                })
            }    
    })
    

    // booking endpoint
    app.get('/booking', function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("Book not implemented")
    })
    app.post('/booking', function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("booking not implemented")
    })    
    
    if(IIS){
        // below line to run it under iis
        app.listen(process.env.PORT)
    }
    else{
        // below code to run as a console app
        var server = app.listen(port, function () {
          //console.log(`Server is running at port ${port}. Worker ${cluster.worker.id} running!`);
          console.log(`Server is running at port ${port}.`);
        });
    }
    
}


