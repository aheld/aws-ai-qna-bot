#! /usr/bin/env node
var name=require('../bin/name')
var config=require('../config')
process.env.AWS_PROFILE=config.profile
process.env.AWS_DEFAULT_REGION=config.profile
var aws=require('aws-sdk')
var Promise=require('bluebird')
aws.config.setPromisesDependency(Promise)
aws.config.region=require('../config').region
var cf=new aws.CloudFormation()
var _=require('lodash')

var prefix=name('a',{prefix:true})
cf.listStacks({
    StackStatusFilter:[
"CREATE_IN_PROGRESS","CREATE_FAILED","CREATE_COMPLETE","ROLLBACK_FAILED","ROLLBACK_COMPLETE","DELETE_FAILED","UPDATE_COMPLETE","UPDATE_ROLLBACK_FAILED","UPDATE_ROLLBACK_COMPLETE"
    ]
}).promise()
.then(x=>x.StackSummaries
    .filter(x=>x.StackName.match(prefix))
    .map(x=>x.StackName))
.map(StackName=>cf.deleteStack({StackName})
    .promise()
    .then(()=>console.log(`deleting: ${StackName}`)))


