../build/templates/test.json: ./cfn/*
	../bin/build.js --input $$(pwd)/cfn/index.js --output $$(pwd)/../build/templates/test.json --verbose

up: ../build/templates/test.json
	npm run stack test up -- --local

