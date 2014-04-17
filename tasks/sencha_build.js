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
	// The default version of Sencha CMD
	var SENCHA_CMD_VERSION = '4.0.2.67';

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
		},
		{
			name: '',
			help: 'Generic sencha command task'
		}
	];

	var cp = require( 'child_process' );
	var log = grunt.log;
	var fail = grunt.fail;

	var compressOutput = true;

	function buildTask ( task ) {
		var taskName = task.name === '' ? PREFIX : PREFIX + '_' + task.name.replace( ' ', '_' );
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

			if ( !options.senchaVersion ) {
				options.senchaVersion = version(SENCHA_CMD_VERSION);
			} else {
				options.senchaVersion = version(options.senchaVersion);
			}

			if ( options.compressOutput ) {
				compressOutput = options.compressOutput;
			}

			// Start building our command
			var cmd = options.cmdPath;

			// Add option to point to a different directory
			if ( options.cwd && options.senchaVersion.major > 3 ){
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
						fail.error( 'paramName ' + paramName + ' is required' );
						return done( false );
					} else if ( contains( param, paramOptions ) === false ) {
						fail.error( 'paramName ' + paramName + ' has to be ' + paramOptions );
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

			var commandParameters = data.params || data.command || /* background compatibility */options.params;
			if ( commandParameters ) {
				cmd += ' ' + commandParameters.join(' ');

				if ( taskName === PREFIX ) {
					log.writeln( 'Running: ' + commandParameters.join(' ')['cyan'] )
				}
			}

			// Simulate property is always available to just dump the cmd it was about to run
			if ( data.simulate ) {
				log.writeln( cmd );
				done();
			} else {
				if ( options.senchaVersion.major === 3 ) {
					runScript( cmd, done, options.cwd );
				} else {
					runScript( cmd, done );
				}
			}

		} );
	}

	// Loop over the defined tasks and build the grunt tasks
	for ( var x = 0; x < tasks.length; x++ ) {
		buildTask( tasks[ x ] );
	}

	// Helper to run an executable
	function runScript ( script, done, cwd ) {
		var warning,
			error,
			options = {};

		if ( cwd ) {
			options.cwd = cwd;
		}

		grunt.verbose.write( "Running script: " + script );

		var childProcess = cp.exec( script, options, function () {
		} );

		var removeExtras = function ( str ) {
			if ( compressOutput ) {
				return str.replace( /\[(INF|ERR|WRN)\][\s]+/g, '' );
			} else {
				return str;
			}
		};

		childProcess.stdout.on( 'data', function ( d ) {
			var message = removeExtras ( d );

			if ( d.match( /^\[ERR\]/ ) ) {
				error = error || message;
				log.error( message );
			} else if ( d.match( /^\[WRN\]/ ) ) {
				warning = warning || message;
				log.warn ( message );
			} else {
				var dataLine = message.trim();
				if ( dataLine ) {
					log.writeln( dataLine );
				}
			}
		} );
		childProcess.stderr.on( 'data', function ( d ) {
			log.error( removeExtras ( d ) );
		} );

		childProcess.on( 'exit', function ( code ) {
			if ( error ) {
				log.writeln(); // write new line to gap from previous output
				fail.fatal( error + ' (see log for details)' );
			}

			if ( warning ) {
				log.writeln(); // write new line to gap from previous output
				fail.warn( warning + ' (see log for details)' );
				log.writeln(); // write new line to gap from previous output
			}

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

	// Helper to compare versions
	function version(ver) {
		var type = typeof ver;

		if ( type === 'number' ) {
			return {
				major: ver
			}
		} else if ( type === 'object' ) {
			return ver;
		}

		var parts = ver.split('.'),
			i;

		for ( i = parts.length; i--; ) {
			parts[i] = parseInt(parts[i], 10);
		}

		return {
			major: parts[0],
			minor: parts[1],
			patch: parts[2],
			build: parts[3]
		};
	}
};
