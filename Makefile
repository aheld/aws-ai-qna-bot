LAMBDAS=$(shell for l in $$(ls ./lambda | grep -v test.js);do echo lambda/$$l;done)
TEMPLATES=$(shell for l in $$(ls ./templates | grep -v util);do echo templates/$$l;done)

All: templates lambda website build

build:
	mkdir -p build; mkdir -p build/lambda; mkdir -p build/templates/test;mkdir -p build/templates;mkdir -p build/documents; mkdir -p build/templates/dev

.PHONY: lambda templates upload website test bootstrap

config.json:
	node config.js.example > config.json

lambda: $(LAMBDAS) build
	for l in $(LAMBDAS); do \
		cd $$l && make; \
		cd ../..;	\
	done;			

bootstrap:
	cd templates/dev && make ../../build/templates/dev/bootstrap.json; cd ../..

templates: $(TEMPLATES) build
	for l in $(TEMPLATES); do \
		cd $$l && make; \
		cd ../..;	\
	done;			

website: build
	cd ./website; make 

samples:docs/blog-samples.json build
	cp docs/blog-samples.json build/documents

upload: templates lambda website build
	./bin/upload.sh

test:
	./bin/test.sh

