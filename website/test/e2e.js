var webdriverio = require('webdriverio');
var outputs=require('../../bin/exports')('dev/master',{wait:true})
var options = { 
    desiredCapabilities: { browserName: 'chrome' } 

};
var client = webdriverio.remote(options);

module.exports={
    login:function(test){
        outputs.then(function(output){
            console.log(output.ContentDesignerLogin)
            return client.init()
            .url(output.ContentDesignerLogin)
            .getUrl()
            .then(console.log)
            .catch(console.log)
        })
        .finally(test.done)
    }
}
