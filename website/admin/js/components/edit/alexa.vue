<template>
  <div id="alexa" v-html="text"></div>
</template>

<script>
/*
Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/

var Vuex=require('vuex')
var markdown=require('marked')
var handlebars=require('handlebars')
var clipboard=require('clipboard')

module.exports={
  data:function(){
    var self=this
    return {
      visible:false,
      clipboard:new clipboard('.clip',{
        text:function(){
          return self.$store.state.bot.slotutterances.join('\n')
        }
      })
    }
  },
  components:{
  },
  computed:Object.assign(
    Vuex.mapState([
        'bot'
    ]),
    {invalid:function(){
      return this.$validator.errors.has('filter')
    },
    text:function(){
      var temp=handlebars.compile(require('./alexa.md'))
      return markdown(temp(this.$store.state))
    }
    }
  ),
  created:function(){
    this.$store.dispatch('botinfo').catch(()=>null) 
  },
  methods:{
  } 
}
</script>
