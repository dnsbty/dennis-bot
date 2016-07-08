'use strict'
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Bot = require('messenger-bot');
const config = require('./config');

let bot = new Bot({
	token: config.page_token,
	verify: config.verify_key,
	app_secret: config.app_secret
});

bot.on('error', (err) => {
	console.error(err.message);
});

bot.on('message', (payload, reply) => {
	let text = payload.message.text;

	bot.getProfile(payload.sender.id, (err, profile) => {
		if (err) throw err;

		reply({ sender_action: 'mark_seen' }, (err) => {
			setTimeout(() => {
				reply({ sender_action: 'typing_on' }, (err) => {
					setTimeout(() => {
						reply({ text }, (err) => {
							if (err) throw err;
						});
					}, 5000);
				});
			}, 2000);
		});
	});
});

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/', (req, res) => {
	return bot._verify(req, res);
});

app.post('/', (req, res) => {
	bot._handleMessage(req.body);
	res.end(JSON.stringify({status: 'ok'}));
});

http.createServer(bot.middleware()).listen(config.port);
console.log(`Echo bot server running at port ${config.port}.`);
