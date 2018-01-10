#! /bin/bash 
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$__dirname/..
cd $BASE

cd $BASE & make bootstrap
npm run --silent stack dev/bootstrap make-sure -- \
    --no-check          \
    --no-interactive    \
    --verbose           \
    --local             

if [ $? -ne 0 ]; then
    echo "failed to create bootstrap bucket"
    exit 1
fi
npm run --silent upload
rm $__dirname/debug.log;
rm $__dirname/output.log;
rm $__dirname/output.json;

echo "ready"
