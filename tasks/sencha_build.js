/*
 * grunt-sencha-build
 * https://github.com/kazmiekr/blackberry-build
 *
 * Copyright (c) 2013 Kevin Kazmierczak
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function ( grunt ) {

	// The prefix to prepend to the task names
	var PREFIX = "sencha";
	// The default path to Sencha CMD
	var SENCHA_CMD_PATH = "sencha";

	var tasks = [
		{
			name: 'app build',
			command: 'commandOptions !environment',
			params: {
				environment: 'production|testing|native|package'
			},
			help: 'Creates a production or testing version of your app'
		},
		{
			name: 'package build',
			help: 'Builds a sencha package'
		},
		{
			name: 'which',
			help: 'Outputs sencha path'
		},
		{
			name: 'compile',
			help: 'This command category provides JavaScript compilation commands. Read more in Sencha CMD documentation'
		}
	];

	var cp = require( 'child_process' );
	var log = grunt.log;

	var compressOutput = false;

	function buildTask ( task ) {
		var taskName = PREFIX + '_' + task.name.replace( ' ', '_' );
		grunt.registerMultiTask( taskName, task.help, function () {
			var options = this.options(),
				done = this.async(),
				data = this.data;

			// Default the command to blank if needed
			task.command = task.command || '';

			// Override the default sencha path
			if ( !options.cmdPath ) {
				options.cmdPath = SENCHA_CMD_PATH;
			}

			if ( options.compressOutput ) {
				compressOutput = options.compressOutput;
			}

			// Start building our command
			var cmd = options.cmdPath;

			// Add option to point to a different directory
			if ( options.cwd ){
				cmd += ' -cw ' + options.cwd;
			}

			// Suppress the logo information
			if ( options.noLogo !== false ) {
				cmd += ' -n';
			}

			// Add our task
			cmd +=	' ' + task.name;

			// Build out our properties to the command
			var parameters = task.command.split( ' ' );
			var parameter;
			for ( var y = 0; y < parameters.length; y++ ) {
				parameter = parameters[y];
				var isRequired = parameter.charAt( 0 ) === '!';
				var paramName = isRequired ? parameter.substring( 1, parameter.length ) : parameter;
				var param = data[ paramName ];
				if ( isRequired ) {
					var paramOptions = task.params[ paramName ];
					if ( param === undefined ) {
						log.error( 'paramName ' + paramName + ' is required' );
						return done( false );
					} else if ( contains( param, paramOptions ) === false ) {
						log.error( 'paramName ' + paramName + ' has to be ' + paramOptions );
						return done( false );
					} else {
						cmd += " " + data[paramName];
					}
				} else {
					if ( param ){
						cmd += " " + param;
					}
				}
			}

			var commandParameters = options.params;
			if ( commandParameters ) {
				cmd += ' ' + commandParameters.join(' ');
			}

			// Simulate property is always available to just dump the cmd it was about to run
			if ( data.simulate ) {
				log.writeln( cmd );
				done();
			} else {
				runScript( cmd, done );
			}

		} );
	}

	// Loop over the defined tasks and build the grunt tasks
	for ( var x = 0; x < tasks.length; x++ ) {
		buildTask( tasks[ x ] );
	}

	// Helper to run an executable
	function runScript ( script, done ) {
		log.debug( "Running script: " + script );

		var childProcess = cp.exec( script, {}, function () {
		} );

		var removeExtras = function ( str ) {
			if ( compressOutput ) {
				return str.replace( /\[(INF|ERR)\][\s]*/g, '' );
			} else {
				return str;
			}
		};

		childProcess.stdout.on( 'data', function ( d ) {
			if ( d.match( /^\[ERR\]/ ) ) {
				log.error( removeExtras ( d ) );
			} else {
				var dataLine = removeExtras ( d ).trim();
				if ( dataLine ) {
					log.writeln( dataLine );
				}
			}
		} );
		childProcess.stderr.on( 'data', function ( d ) {
			log.error( removeExtras ( d ) );
		} );

		childProcess.on( 'exit', function ( code ) {
			if ( code !== 0 ) {
				log.error( 'Exited with code: %d.', code );
				return done( false );
			}
			done();
		} );
	}

	// Helper to see if a value is in a list
	function contains ( value, list ) {
		var isFound = false;
		var props = list.split( '|' );
		for ( var x = 0; x < props.length; x++ ) {
			if ( value === props[ x ] ) {
				isFound = true;
				break;
			}
		}
		return isFound;
	}
};
