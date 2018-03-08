'use strict'

const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const parse = require('parse-jsonp')

const isObj = o => 'object' === typeof o && o !== null && !Array.isArray(o)

const endpoint = 'https://data-live.flightradar24.com/zones/fcgi/feed.js'
const headers = {
	'User-Agent': 'https://github.com/derhuerst/fetch-flightradar24-flights'
}

const defaults = {
	// see: https://www.flightradar24.com/how-it-works
	FAA:   		true, 	// use US/Canada radar data source
	FLARM: 		true, 	// use FLARM data source
	MLAT: 		true, 	// use MLAT data source
	ADSB: 		true, 	// use ADS-B data source
	ESTIMATED: 	false,	// use out of coverage position estimate if [known|unknown] destination: [2 hr | 10 min] 
	inAir: 		true, 	// fetch airborne aircraft
	onGround: 	false, 	// fetch (active) aircraft on ground
	inactive: 	false, 	// fetch (active) vehicles on ground
	gliders: 	true 	// fetch gliders
	// stats: 	true, 	// 
	// ems: 	true, 	// fetch "Emergency, Medical, Search Aid and Rescue (SAR)" aircraft
}

const request = (north, west, south, east, when, opt = {}) => {
	if ('number' !== typeof north) throw new Error('north must be a number')
	if ('number' !== typeof west) throw new Error('west must be a number')
	if ('number' !== typeof south) throw new Error('south must be a number')
	if ('number' !== typeof east) throw new Error('east must be a number')
	if (when && 'number' !== typeof when) throw new Error('when must be a number')
	opt = Object.assign({}, defaults, opt)

	const query = {
		bounds: [north, south, west, east].join(','),	// 
		callback: 'jsonp',						// 
		// options: altitude, estimated, maxage, speed, stats, ems, (history, prefetch)?
		// ToDo: 	maxage, stats, (history, prefetch)?
		faa: opt.FAA ? '1' : '0',				// 
		mlat: opt.MLAT ? '1' : '0',				// 
		flarm: opt.FLARM ? '1' : '0',			// 
		adsb: opt.ADSB ? '1' : '0',				// 
		gnd: opt.onGround ? '1' : '0',			// 
		air: opt.inAir ? '1' : '0',				// 
		vehicles: opt.inactive ? '1' : '0',		// 
		estimated: opt.ESTIMATED ? '1' : '0',	// 
		//maxage: opt.maxage ? '1' : '0', 		// The Max time in [300-14400 sec] for ESTIMATED aircraft
		gliders: opt.gliders ? '1' : '0'		// 
		//stats: opt.stats ? '1' : '0',			// ?
		//ems: opt.ems ? '1' : '0',				// ?
	}
	if (when) query.history = Math.round(when / 1000)

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
		if (!isObj(data)) throw new Error('response data must be an object')

		const aircraft = []
		for (let id in data) {
			const d = data[id]
			if (!Array.isArray(d)) continue
			aircraft.push({
				id,							// Unique F24 id ?
				modes: d[0] || null,		// Mode-S Transponder code: 6-digit [hex] is a 24-bit ICAO issued code
				latitude: d[1],				// in decimal degrees
				longitude: d[2],			// in decimal degrees
				bearing: d[3], 				// in [degrees]
				altitude: d[4], 			// in [feet] 
				speed: d[5], 				// in [knots]
				squawk: d[6],				// Mode-3/A Transponder code: 4-digit [octal] is the "Squawk" ATC assigned code
				radar: d[7],				// F24 "radar" data source (ADS-B, MLAT, RADAR (ATC feed), FLARM, "ESTIMATED") designator
				model: d[8] || null,		// ICAO Aircraft Type Designator
				registration: d[9] || null,	// ICAO Aircraft (tail) registration number
				timestamp: d[10] || null, 	// Timestamp [Unix/POSIX/epoch]
				origin: d[11] || null,		// Departure Airport IATA
				destination: d[12] || null,	// Destination Airport IATA
				flight: d[13] || null,		// IATA Flight Id
				ground: d[14],				// Airplane is "onGround": [0|1] 
				climb: d[15],				// "Rate of Climb" (RoC) is a vertical speed [ft/m]
				callsign: d[16] || null,	// ICAO ATC call signature
				glider: d[17],				// Aircraft is a glider:   [0|1]  (There are usually no or very few gliders registered on earth!)
			})
		}
		return aircraft
	})
}

module.exports = request
