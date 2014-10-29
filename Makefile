##
# node-iap project Makefile
# description     : Makefile to install this project and its dependencies along with other helpers
# author          : Almir Kadric
# created on      : 2014-10-29
##


##
# Global variables
##

# Set default shell
SHELL = /bin/bash

# Function for help
define helpText

######################################
###       Node InAppPurchases      ###
######################################

make install         Install project dependencies
make dev             Install & setup project & development dependencies

make test            Runs all tests (shortcut for test-lint and test-unit).
make test-unit       Run all unit tests
make test-lint       Lint the entire project

endef
export helpText


##
# Make Targets
##

# List of target which should be run every time without caching
.PHONY: install dev test test-unit test-lint


# Default make target
%::
	@echo "$$helpText"
Default :
	@echo "$$helpText"


# Install target
install :
	npm install --production

# Dev target
dev :
	npm install
	./sbin/lint.sh setup

# Test all
test : test-lint test-unit

# Unit test target
test-unit :
	./node_modules/.bin/mocha -R spec --recursive ./tests

# Lint target
test-lint :
	./sbin/lint.sh ${lintFilter}