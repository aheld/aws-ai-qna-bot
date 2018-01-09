#! /bin/bash 
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export AWS_PROFILE=$(node -e "console.log(JSON.stringify(require('$__dirname'+'/../config')))" | $(npm bin)/jq --raw-output ".profile")
export AWS_DEFAULT_REGION=$(node -e "console.log(JSON.stringify(require('$__dirname'+'/../config')))" | $(npm bin)/jq --raw-output ".region")

OUTPUT=$($__dirname/exports.js dev/bootstrap)
BUCKET=$( echo $OUTPUT | $(npm bin)/jq --raw-output '."Bucket"')
PREFIX=$( echo $OUTPUT | $(npm bin)/jq --raw-output '."Prefix"')
REGION=$AWS_DEFAULT_REGION

MASTER="http://s3.amazonaws.com/$BUCKET/$PREFIX/templates/master.min.json"
PUBLIC="http://s3.amazonaws.com/$BUCKET/$PREFIX/templates/public.min.json"

echo "========================Master=============="
echo "template url:"
echo "$MASTER"
echo ""
echo "console launch url:"
echo "https://console.aws.amazon.com/cloudformation/home?region=$REGION#/stacks/new?stackName=QnABot&templateURL=$MASTER"
echo ""
echo ""
echo "========================Public=============="
echo "template url:"
echo "$PUBLIC"
echo ""
echo "console launch url:"
echo "https://console.aws.amazon.com/cloudformation/home?region=$REGION#/stacks/new?stackName=QnABot&templateURL=$PUBLIC"

