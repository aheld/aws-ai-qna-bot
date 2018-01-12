#! /usr/bin/env node
var config=require('../config')
process.env.AWS_PROFILE=config.profile
process.env.AWS_DEFAULT_REGION=config.profile
var aws=require('aws-sdk')
var Promise=require('bluebird')
aws.config.setPromisesDependency(Promise)
aws.config.region=require('../config').region
var _=require('lodash')
var fs=require('fs')
var cf=new aws.CloudFormation()
var chalk=require('chalk')
var build=require('./build')
var check=require('./check')
var argv=require('commander')
var name=require('./name')
var wait=require('./wait')
var s3=new aws.S3()
var ran

if (require.main === module) {
    var args=argv.version('1.0')
        .name("npm run stack")
        .arguments('[stack] [op] [options]')
        .usage("[stack] [op] [options]")
        .option('-v, --verbose',"print additional debuging information")
        .option('-d, --dry-run',"run command but do not launch any stacks")
        .option('--no-check',"do not check stack syntax")
        .option('-q --silent',"do output information")
        .option('--action <action>',"the opteration to do")
        .option('--input <input>',"input template")
        .option('--no-wait',"do not wait for stack to complete")
        .option('--no-interactive',"omit interactive elements of output (spinners etc.)")
        .on('--help',()=>{
            log(
`  
  operations:

    up:         launch a stack
    update:     update a stack
    down:       terminate a stack
    restart:    terminate a stack then launch a new one
    make-sure:  check is stack is up, if not then launch one
`,{})
        })
        .parse(process.argv)

    var options=argv
    var stack=!options.input ? options.args[0] : options.input.split('/')
        .reverse()
        .filter(x=>x)
        .slice(0,2)
        .reverse().join('-').split('.')[0]
    var op=options.input ? options.args[0] : options.args[1]
    console.log(stack,op,options)
    if( stack && op){
        switch(op){
            case "up":
                up(stack,options || {})
                break;
            case "update":
                update(stack,options || {})
                break;
            case "down":
                down(stack,options || {})
                break;
            case "restart":
                log("restarting stack",options||{})
                down(stack,options || {}).then(()=>up(stack,options || {}))
                break;
            case "make-sure":
                sure(stack,options)
                break;
            default:
                argv.outputHelp()
        }
    }else{
        argv.outputHelp()
    }
}
function syntax(stack,options){
    if(options.check){
        return check(stack,options)
        .tap(x=>log("Template Valid",options))
        .tapCatch(x=>log(x.message,options))
    }else{
        return Promise.resolve()
    }
}
function up(stack,options){
    return build({
        stack:stack,
        input:options.input,
        silent:options.silent
    })
    .then(()=>{
        var StackName=name(stack,{inc:true})
        log(`launching stack:${stack}`,options)
        if(!options.dryRun){
            var template=fs.readFileSync(
                `${__dirname}/../build/templates/${stack}.json`
            ,'utf-8')
            if(Buffer.byteLength(template)<51200){
                console.log(template) 
                var start=cf.createStack({
                    StackName,
                    Capabilities:["CAPABILITY_NAMED_IAM"],
                    DisableRollback:true,
                    TemplateBody:template
                }).promise()
            }else{
                var start=bootstrap().then(function(exp){
                    var bucket=exp.Bucket
                    var prefix=exp.Prefix
                    var url=`http://s3.amazonaws.com/${bucket}/${prefix}/templates/${stack}.json`
                    console.log(url)
                    return s3.putObject({
                        Bucket:bucket,
                        Key:`${prefix}/templates/${stack}.json`,
                        Body:template
                    }).promise()
                    .then(()=>cf.createStack({
                        StackName,
                        Capabilities:["CAPABILITY_NAMED_IAM"],
                        DisableRollback:true,
                        TemplateURL:url
                    }).promise())
                })
            }

            return start.then(x=>{  
                log(`stackname: ${StackName}`,options)
                log(`stackId: ${x.StackId}`,options)
                if(options.wait){
                    return wait(stack,{show:!options.silent})
                }
            })
        }
    })
    .catch(x=>{
        log("failed"+x,options)
        process.exit(1)
    })
}
function update(stack,options){
    return syntax(stack,options)
    .then(()=>bootstrap())
    .then(exp=>{
        var StackName=name(stack,{})
        log("Updating stack",options)
        var bucket=exp.Bucket
        var prefix=exp.Prefix
        var url=`http://s3.amazonaws.com/${bucket}/${prefix}/templates/${stack}.json`
        if(!options.dryRun){
            return cf.updateStack({
                StackName,
                Capabilities:["CAPABILITY_NAMED_IAM"],
                TemplateURL:url
            }).promise()
            .then(x=>{  
                log(`stackname: ${StackName}`,options)
                log(`stackId: ${x.StackId}`,options)
                if(options.wait){
                    return wait(stack,{show:!options.silent})
                }
            })
            .catch(x=>{throw x.message})
        }
    })
    .catch(x=>{
        log(x,options)
        process.exit(1)
    })
}
function down(stack,options){
    var StackName=name(stack,{})
    log("terminating stack",options)
    if(!options.dryRun){
        return cf.describeStacks({
            StackName
        }).promise()
        .then(x=>x.Stacks[0].StackId)
        .tap(id=>cf.deleteStack({
            StackName:id
        }).promise())
        .then(id=>{  
            if(options.wait){
                return wait(stack,{
                    Id:id,
                    show:options.interactive
                })
            }
        })
        .catch(x=>_.get(x,"message","").match(/.*does not exist$/),function(){})
        .catch(x=>{
            log(x,options)
            process.exit(1)
        })
    }
}

function sure(stack,options={}){
    var StackName=name(stack)
    log(`making sure stack ${stack} is up`,options)
    return cf.describeStacks({StackName}).promise()
    .then(()=>wait(stack,{show:options.interactive && !options.silent}))
    .then(x=>log(`${stack} is up as ${StackName}`,options))
    .catch(x=>_.get(x,"message","").match(/.*does not exist$/),function(){
        log("Stack does not exist",options)
        return up(stack,options)
    })
}

function log(message,options){
    if(!options.silent){
        console.log(message)
    }
}

function bootstrap(){
    var outputs={}
    return cf.describeStacks({
        StackName:name("dev/bootstrap",{})
    }).promise()
    .then(x=>x.Stacks[0].Outputs)
    .map(x=>outputs[x.OutputKey]=x.OutputValue)
    .return(outputs)
}
exports.up=up
exports.down=down
exports.sure=sure
exports.update=update
