BUILD=../../bin/build.js
NAME=$(shell basename $(shell pwd))
DST=../../build/templates/dev

all:$(DST)/domain.json $(DST)/bucket.json $(DST)/cognito.json $(DST)/master.json  $(DST)/bootstrap.json $(DST)/lambda.json $(DST)/api.json

$(DST)/bootstrap.json:./bootstrap.json
	 cp ./bootstrap.json $(DST)/bootstrap.json

$(DST)/domain.json:./domain.*
	 $(BUILD) $(NAME)/domain

$(DST)/api.json:./api.*
	 $(BUILD) $(NAME)/api

$(DST)/lambda.json:./lambda.*
	 $(BUILD) $(NAME)/lambda

$(DST)/bucket.json:./bucket.*
	 $(BUILD) $(NAME)/bucket

$(DST)/cognito.json:./cognito.*
	 $(BUILD) $(NAME)/cognito

$(DST)/master.json:./master.* ../master/*
	 $(BUILD) $(NAME)/master


