/*
 * grunt-sencha-build
 * https://github.com/kevin/SenchaBuild
 *
 * Copyright (c) 2013 Kevin Kazmierczak
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	var senchaTouchApp = '/Users/kevin/Desktop/Sencha/public/GruntApp';
	var extApp = '';
	var senchaPackage = '';

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

		sencha_app_build: {
			touch_test: {
				options: {
					cwd: senchaTouchApp
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