#! /bin/bash 
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$__dirname/..
cd $BASE

PROFILE="default"

if aws s3 ls --profile $PROFILE >> /dev/null; then
    echo "aws cli configured"
else
    echo "configuring aws cli"
    region=$AWS_REGION
    creds=$(curl 169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI)

    aws configure set aws_access_key_id $( echo $creds | $(npm bin)/jq --raw-output ".AccessKeyId")
    aws configure set aws_secret_access_key $( echo $creds | $(npm bin)/jq --raw-output ".SecretAccessKey")
    aws configure set aws_session_token $( echo $creds | $(npm bin)/jq --raw-output ".Token")
    aws configure set $PROFILE.region $region
fi
aws configure list --profile $PROFILE

if [ ! -f ./config.json ]; then 
    CLI_REGION=$(aws configure get region --profile $PROFILE)
    echo "creating config"

    node $BASE/config.js.example john@example.com $CLI_REGION > $BASE/config.json
    cat $BASE/config.json > $BASE/tmp.json
    cat $BASE/tmp.json | jq '.profile=\"$PROFILE\"' > $BASE/config.json
    rm $BASE/tmp.json
fi

cat $BASE/config.json > $BASE/tmp.json
cat $BASE/tmp.json | jq '.namespace="Validate"' > $BASE/config.json
rm $BASE/tmp.json


