import qs from 'querystring'
import _fetch from 'fetch-ponyfill'
const {fetch} = _fetch()
import moment from 'moment-timezone'
import {getRandomUserAgent} from './random-user-agent.js'

const endpoint = 'https://data-live.flightradar24.com/clickhandler/'

const headers = {
	'Accept': 'application/json',
}

const fetchFlight = async (flight) => {
	if ('string' !== typeof flight) throw new TypeError('flight must be a string')

	const url = endpoint + '?' + qs.stringify({flight, version: '1.5'})
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
	const d = await res.json()

	const orig = d.airport?.origin ?? {}
	const dest = d.airport?.destination ?? {}
	const time = d.time ?? {}

	let dep = time.real?.departure ?? time.estimated?.departure ?? time.scheduled?.departure
	if (dep) dep = moment.tz(dep * 1000, orig.timezone?.name ?? null).format()
	let sDep = time.scheduled?.departure
	if (sDep) sDep = moment.tz(sDep * 1000, orig.timezone?.name ?? null).format()

	let arr = time.real?.arrival ?? time.estimated?.arrival ?? time.scheduled?.arrival
	if (arr) arr = moment.tz(arr * 1000, dest.timezone?.name ?? null).format()
	let sArr = time.scheduled?.arrival
	if (sArr) sArr = moment.tz(sArr * 1000, dest.timezone?.name ?? null).format()

	let delay = time.historical?.delay ?? null
	if (delay) delay = parseInt(delay)

	return {
		id: d.identification?.id ?? null,
		callsign: d.identification?.callsign ?? null,
		liveData: d.status?.live ?? null,
		model: d.aircraft?.model?.code ?? null,
		registration: d.aircraft?.registration ?? null,
		airline: d.airline?.code?.iata ?? null,
		origin: {
			id: orig.code?.iata ?? null,
			name: orig.name ?? null,
			coordinates: {
				latitude: orig.position?.latitude ?? null,
				longitude: orig.position?.longitude ?? null,
				altitude: orig.position?.altitude ?? null,
			},
			timezone: orig.timezone?.name ?? null,
			country: orig.position?.country?.code ?? null,
		},
		destination: {
			id: dest.code?.iata ?? null,
			name: dest.name ?? null,
			coordinates: {
				latitude: dest.position?.latitude ?? null,
				longitude: dest.position?.longitude ?? null,
				altitude: dest.position?.altitude ?? null,
			},
			timezone: dest.timezone?.name ?? null,
			country: dest.position?.country?.code ?? null,
		},
		departure: dep || null,
		scheduledDeparture: sDep || null,
		departureTerminal: orig.info?.terminal ?? null,
		departureGate: orig.info?.gate ?? null,
		arrival: arr || null,
		scheduledArrival: sArr || null,
		arrivalTerminal: dest.info?.terminal ?? null,
		arrivalGate: dest.info?.gate ?? null,
		delay, // in seconds
		// todo: d.time.historical.flighttime
		// todo: d.flightHistory
		// todo: d.trail
		// todo: what is d.s?
	}
}

export {
	fetchFlight,
}
