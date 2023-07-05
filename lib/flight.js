'use strict'

const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const getProp = require('dot-prop').get
const moment = require('moment-timezone')

const endpoint = 'https://data-live.flightradar24.com/clickhandler/'

// const headers = {
// 	'User-Agent': 'https://github.com/derhuerst/fetch-flightradar24-flights'
// }

/// PKO header
/// Force a rotation of user-agent string, to avoid autmated blocking @FR24 side
/// Data source: https://www.useragents.me/  i take manually the top 10 
///////////////////////////////////////////////////////////////////////////////////////////
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

/// EOPKO

const request = (flight) => {
	if ('string' !== typeof flight) throw new Error('flight must be a string')

	const url = endpoint + '?' + qs.stringify({flight, version: '1.5'})
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
		return res.json()
	})
	.then((d) => {
		const p = getProp.bind(null, d)
		const orig = getProp.bind(null, p('airport.origin') || {})
		const dest = getProp.bind(null, p('airport.destination') || {})
		const time = getProp.bind(null, p('time') || {})

		let dep = time('real.departure') || time('estimated.departure') || time('scheduled.departure')
		if (dep) dep = moment.tz(dep * 1000, orig('timezone.name')).format()
		let sDep = time('scheduled.departure')
		if (sDep) sDep = moment.tz(sDep * 1000, orig('timezone.name')).format()

		let arr = time('real.arrival') || time('estimated.arrival') || time('scheduled.arrival')
		if (arr) arr = moment.tz(arr * 1000, dest('timezone.name')).format()
		let sArr = time('scheduled.arrival')
		if (sArr) sArr = moment.tz(sArr * 1000, dest('timezone.name')).format()

		let delay = time('historical.delay') || null
		if (delay) delay = parseInt(time('historical.delay'))

		return {
			id: p('identification.id'),
			callsign: p('identification.callsign'),
			liveData: p('status.live'),
			model: p('aircraft.model.code'),
			registration: p('aircraft.registration'),
			airline: p('airline.code.iata'),
			origin: {
				id: orig('code.iata'),
				name: orig('name'),
				coordinates: {
					latitude: orig('position.latitude'),
					longitude: orig('position.longitude'),
					altitude: orig('position.altitude')
				},
				timezone: orig('timezone.name'),
				country: orig('position.country.code')
			},
			destination: {
				id: dest('code.iata'),
				name: dest('name'),
				coordinates: {
					latitude: dest('position.latitude'),
					longitude: dest('position.longitude'),
					altitude: dest('position.altitude')
				},
				timezone: dest('timezone.name'),
				country: dest('position.country.code')
			},
			departure: dep || null,
			scheduledDeparture: sDep || null,
			departureTerminal: orig('info.terminal'),
			departureGate: orig('info.gate'),
			arrival: arr || null,
			scheduledArrival: sArr || null,
			arrivalTerminal: dest('info.terminal'),
			arrivalGate: dest('info.gate'),
			delay // in seconds
			// todo: d.time.historical.flighttime
			// todo: d.flightHistory
			// todo: d.trail
			// todo: what is d.s?
		}
	})
}

module.exports = request
