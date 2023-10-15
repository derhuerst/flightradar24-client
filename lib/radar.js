import qs from 'querystring'
import _fetch from 'fetch-ponyfill'
const {fetch} = _fetch()
import parse from 'parse-jsonp'
import {getRandomUserAgent} from './random-user-agent.js'

const isObj = o => 'object' === typeof o && o !== null && !Array.isArray(o)

const endpoint = 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js'

const headers = {
	'Accept': 'application/javascript',
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

const fetchFromRadar = async (north, west, south, east, when, opt = {}) => {
	if ('number' !== typeof north) throw new TypeError('north must be a number')
	if ('number' !== typeof west) throw new TypeError('west must be a number')
	if ('number' !== typeof south) throw new TypeError('south must be a number')
	if ('number' !== typeof east) throw new TypeError('east must be a number')
	if (when && 'number' !== typeof when) throw new TypeError('when must be a number')
	opt = {
		...defaults,
		...opt,
	}

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
		estimated: opt.estimatedPositions ? '1' : '0',
		// todo: maxage, stats, history, prefetch
	}
	if (when) query.history = Math.round(when / 1000)

	const url = endpoint + '?' + qs.stringify(query)
	const res = await fetch(url, {
		mode: 'cors',
		redirect: 'follow',
		headers: {
			...headers,
			'User-Agent': getRandomUserAgent(),
		},
		referrer: 'no-referrer',
		referrerPolicy: 'no-referrer',
	})
	if (!res.ok) {
		const err = new Error(res.statusText)
		err.statusCode = res.status
		throw err
	}
	const jsonp = await res.text()
	const data = parse('jsonp', jsonp)
	if (!isObj(data)) throw new Error('response data must be an object')

	const aircraft = []
	for (let id in data) {
		const d = data[id]
		if (!Array.isArray(d)) continue
		aircraft.push({
			id,
			registration: d[9] ?? null,
			flight: d[13] ?? null,
			callsign: d[16] ?? null, // ICAO ATC call signature
			origin: d[11] ?? null, // airport IATA code
			destination: d[12] ?? null, // airport IATA code
			latitude: d[1],
			longitude: d[2],
			altitude: d[4], // in feet
			bearing: d[3], // in degrees
			speed: d[5] ?? null, // in knots
			rateOfClimb: d[15], // ft/min
			isOnGround: !!d[14],
			squawkCode: d[6], // https://en.wikipedia.org/wiki/Transponder_(aeronautics)
			model: d[8] ?? null, // ICAO aircraft type designator
			modeSCode: d[0] ?? null, // ICAO aircraft registration number
			radar: d[7], // F24 "radar" data source ID
			isGlider: !!d[17],
			timestamp: d[10] ?? null,
		})
	}

	return aircraft
}

export {
	fetchFromRadar,
}
