'use strict'

const qs = require('querystring')
const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const getProp = require('dot-prop').get
const moment = require('moment-timezone')

const endpoint = 'https://data-live.flightradar24.com/clickhandler/'
const headers = {
	'User-Agent': 'https://github.com/derhuerst/fetch-flightradar24-flights'
}

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
