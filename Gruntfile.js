/*
 * grunt-sencha-build
 * https://github.com/kevin/SenchaBuild
 *
 * Copyright (c) 2013 Kevin Kazmierczak
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	var senchaTouchApp = '/Users/KKazmierczak/Documents/Programming/Web/SenchaApps/public/GruntApp';
	var extApp = '/Users/KKazmierczak/Documents/Programming/Web/SenchaApps/public/myapp';

	grunt.initConfig({

		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		sencha_which: {
			testing: {}
		},

		sencha_package_build: {
			testing: {}
		},

		sencha_compile: {
			touch: {
				options: {
					cwd: senchaTouchApp
				},
				params: [
					"page -i index.html -o output.html"
				]
			}
		},

		sencha:{
			concat: {
				command: [
					"fs concat -to=output.js input1.js input2.js input3.js"
				]
			}
		},

		sencha_app_build: {
			ext_test: {
				options: {
					cwd: extApp,
                    compressOutput: false,
                    failOnWarn: true
				},
				environment: 'testing'
			},
			touch_test: {
				options: {
					cwd: senchaTouchApp,
					compressOutput: false
				},
				environment: 'testing'
			},
			testing_custom_output: {
				environment: 'testing',
				commandOptions: '-d somefolder'
			},
			production:{
				environment: 'production'
			}
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// By default, lint and run all tests.
	grunt.registerTask('default', ['jshint', 'sencha_app_build:touch_test']);

};