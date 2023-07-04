'use strict'

const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const parse = require('parse-jsonp')

const isObj = o => 'object' === typeof o && o !== null && !Array.isArray(o)

const endpoint = 'https://data-live.flightradar24.com/zones/fcgi/feed.js'
// const headers = {
// 	'User-Agent': 'https://github.com/derhuerst/fetch-flightradar24-flights'
// }

/// PKO header
/// force a rotation of user-agent string, to avoid autmated blicking @FR side

const uas= ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"
,"Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36"
,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
,"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
,"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1"
,"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.51"
,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15"
,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.3"
,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6,2 Safari/605.1.1"
,"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 OPR/99.0.0.") 

const headers = {
	'User-Agent': uas[Math.floor(Math.random()*uas.length)]
}
const defaults = {
	FAA: true, // use US/Canada radar data source
	FLARM: true, // use FLARM data source
	MLAT: true, // use MLAT data source
	ADSB: true, // use ADS-B data source
	inAir: true, // fetch airborne aircraft
	onGround: false, // fetch (active) aircraft on ground
	inactive: false, // fetch inactive aircraft (on ground)
	gliders: false, // fetch gliders
	estimatedPositions: false // if out of coverage
}

const request = (north, west, south, east, when, opt = {}) => {
	if ('number' !== typeof north) throw new Error('north must be a number')
	if ('number' !== typeof west) throw new Error('west must be a number')
	if ('number' !== typeof south) throw new Error('south must be a number')
	if ('number' !== typeof east) throw new Error('east must be a number')
	if (when && 'number' !== typeof when) throw new Error('when must be a number')
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
		gliders: opt.gliders ? '1' : '0',
		estimated: opt.estimatedPositions ? '1' : '0'
		// todo: maxage, stats, history, prefetch
	}
	if (when) query.history = Math.round(when / 1000)

	const url = endpoint + '?' + qs.stringify(query)
	return fetch(url, {
		mode: 'cors',
		redirect: 'follow',
		headers,
		referrer: 'no-referrer',
		referrerPolicy: 'no-referrer'
	})
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
				id,
				registration: d[9] || null,
				flight: d[13] || null,
				callsign: d[16] || null, // ICAO ATC call signature
				origin: d[11] || null, // airport IATA code
				destination: d[12] || null, // airport IATA code
				latitude: d[1],
				longitude: d[2],
				altitude: d[4], // in feet
				bearing: d[3], // in degrees
				speed: d[5] || null, // in knots
				rateOfClimb: d[15], // ft/min
				isOnGround: !!d[14],
				squawkCode: d[6], // https://en.wikipedia.org/wiki/Transponder_(aeronautics)
				model: d[8] || null, // ICAO aircraft type designator
				modeSCode: d[0] || null, // ICAO aircraft registration number
				radar: d[7], // F24 "radar" data source ID
				isGlider: !!d[17],
				timestamp: d[10] || null
			})
		}

		return aircraft
	})
}

module.exports = request
