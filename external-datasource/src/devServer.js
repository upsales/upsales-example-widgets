#!/usr/bin/env node

if (process.env.ENV === 'MASTER') {
	console.error('Do not use nodemon in production');
	return;
}

const ngrok = require('ngrok');
const nodemon = require('nodemon');
ngrok
	.connect({
		proto: 'http',
		addr: 32022,
		authtoken: '24VE9EyXYcbTtaTK0Rpm5XeAYgy_5qWWhNXBc8HDuDWz9aLAt'
	})
	.then(url => {
		console.log(`ngrok tunnel opened at: ${url}`);
		console.log('Open the ngrok dashboard at: http://localhost:4040\n');

		nodemon({
			script: 'server.js',
			exec: 'node'
		})
			.on('start', () => {
				console.log('App started');
			})
			.on('restart', files => {
				console.group('Files changed:');
				files.forEach(file => console.log(file));
				console.groupEnd();
				console.log('ngrok still running on ' + url);
			})
			.on('quit', () => {
				console.log('The app was terminated, closing ngrok tunnel');
				ngrok.kill().then(() => process.exit(0));
			});
	})
	.catch(error => {
		console.error('Error opening ngrok tunnel: ', error);
		process.exitCode = 1;
	});