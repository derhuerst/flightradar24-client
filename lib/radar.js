'use strict'

const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const parse = require('parse-jsonp')

const endpoint = 'https://data-live.flightradar24.com/zones/fcgi/feed.js'
const headers = {
	'User-Agent': 'https://github.com/derhuerst/fetch-flightradar24-flights'
}

const defaults = {
	FAA: true, // use US/Canada radar data source
	FLARM: true, // use FLARM data source
	MLAT: true, // use MLAT data source
	ADSB: true, // use ADS-B data source
	inAir: true, // fetch airborne aircraft
	onGround: false, // fetch (active) aircraft on ground
	inactive: false, // fetch inactive aircraft (on ground)
	gliders: false // fetch gliders
}

const request = (north, west, south, east, opt = {}) => {
	if ('number' !== typeof north) throw new Error('north must be a number')
	if ('number' !== typeof west) throw new Error('west must be a number')
	if ('number' !== typeof south) throw new Error('south must be a number')
	if ('number' !== typeof east) throw new Error('east must be a number')
	opt = Object.assign({}, defaults, opt)

	const query = {
		bounds: [north, south, west, east].join(','),
		callback: 'jsonp',
		// options
		faa: opt.FAA ? '1' : '0',
		flarm: opt.FLARM ? '1' : '0',
		mlat: opt.MLAT ? '1' : '0',
		adsb: opt.ADSB ? '1' : '0',
		air: opt.inAir ? '1' : '0',
		gnd: opt.onGround ? '1' : '0',
		vehicles: opt.inactive ? '1' : '0',
		gliders: opt.gliders ? '1' : '0'
		// todo: bounds, estimated, maxage, stats, history, prefetch, _
	}

	const url = endpoint + '?' + qs.stringify(query)
	return fetch(url, {mode: 'cors', redirect: 'follow', headers})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.text()
	})
	.then((jsonp) => {
		const data = parse('jsonp', jsonp)
		if (!data) throw new Error('invalid data')

		const aircraft = []
		for (let id in data) {
			const d = data[id]
			if (!Array.isArray(d)) continue
			aircraft.push({
				// 10: timestamp, not needed
				// todo: 6, 14
				registration: d[9] || null,
				flight: d[13] || null,
				callsign: d[16] || null,
				origin: d[11] || null,
				destination: d[12] || null,
				latitude: d[1],
				longitude: d[2],
				altitude: d[4], // in feet
				bearing: d[3], // in degrees
				speed: d[5], // in knots
				model: d[8] || null,
				modeSCode: d[0] || null,
				radar: d[7]
			})
		}

		return aircraft
	})
}

module.exports = request
