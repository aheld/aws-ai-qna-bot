#! /usr/bin/env node
var config=require('../config')
var fs=require('fs')
process.env.AWS_PROFILE=config.profile
process.env.AWS_DEFAULT_REGION=config.profile

module.exports=run

if (require.main === module) {
    var argv=require('commander')
    var ran
    var args=argv.version('1.0')
        .arguments('<stack>')
        .usage("<stack> [options]")
        .option('--inc',"increment value")
        .option('-n, --namespace <name>',"stack namespace")
        .action(function(stack,options){
            ran=true
            console.log(options)
            console.log(run(stack,options))
        })
        .parse(process.argv)
    if(!ran){
        argv.outputHelp()
    }
}

function run(stack,options={}){
    try {
        var increments=require('./.inc')
    } catch(e){
        console.log(e)
        var increments={}
    }
    var full=[options.namespace].concat(stack.split('/')).filter(x=>x).join('-')
    var increment=increments[full] || 0

    if(options.inc){
        increment++
        increments[full]=increment
        fs.writeFileSync(__dirname+'/.inc.json',JSON.stringify(increments))
    }

    return `QNA-${full}-${increment}`
}


