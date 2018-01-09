#! /usr/bin/env node
var Promise=require('bluebird')
var fs=Promise.promisifyAll(require('fs'))
process.env.AWS_PROFILE=require('../config').profile
process.env.AWS_DEFAULT_REGION=require('../config').profile
var aws=require('aws-sdk')
var chalk=require('chalk')
aws.config.setPromisesDependency(Promise)
aws.config.region=require('../config').region
var cf=new aws.CloudFormation()
var s3=new aws.S3()
var stringify=require("json-stringify-pretty-compact")
var check=require('./check')
var fs = require('fs');
var outputs=require('./exports')

if(!module.parent){
    create(process.argv[2],{silent:process.argv[3]})
}

function create(stack,options={}){
    log('building '+stack,!options.silent)
    var file=__dirname+'/../templates/'+stack
    var output=`${__dirname}/../build/templates/${stack}.json`
    
    return Promise.resolve(require(file))
    .then(x=> typeof x ==="object" ? JSON.stringify(x) : x)
    .tap(()=>log("writting to "+output,!options.silent))
    .then(temp=>fs.writeFileAsync(output,stringify(JSON.parse(temp))))
    .then(()=>check(stack))
    .tap(()=>log(chalk.green(stack+" is valid"),!options.silent))
    .tap(()=>log('finished building '+stack,!options.silent))
    .catch(error=>log(chalk.red(stack+" failed:"+error),!options.silent))
}

function log(message,show){
    if(show){console.log(message)}
}




