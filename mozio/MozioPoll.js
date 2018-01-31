// Polling Mozio data for search results
let https = require('https');
let querystring = require('querystring');
module.exports = function searchPoll(response_searchid,callbackfunc){
    if(response_searchid!==undefined && response_searchid!=='' ){
      //console.log(response_searchid)
      var options = {
        host: 'api-testing.mozio.com',
        port: 443,
        method: 'GET',
        path: '/v2/search/'+response_searchid+'/poll/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'API-KEY':'947d9ddec286468cbb3593a857155838'
        }
      };    
        // request object
        var Subreq = https.request(options, (Subreq)=> {
          var result = '';
          Subreq.on('data', (chunk)=> {
            result += chunk;
          });
          Subreq.on('end', ()=> {
                //console.log("polled >>"+ result )
                callbackfunc(result)

            //}); // INSERT INTO DATABASE
          });
          Subreq.on('error', (err)=> {
            console.error(err);
          })
        })
        Subreq.write('');
        Subreq.end();
    }
    else{
      callbackfunc('Error:');
      return;
    }
  }
  