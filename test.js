import test from 'tape'

import {fetchFromRadar} from './lib/radar.js'
import {fetchFlight} from './lib/flight.js'

const validateAirport = (t, a) => {
	t.equal(typeof a.id, 'string') // todo: validate IATA code
	t.equal(typeof a.name, 'string')
	t.ok(a.coordinates)
	t.equal(typeof a.coordinates.latitude, 'number')
	t.equal(typeof a.coordinates.longitude, 'number')
	t.equal(typeof a.coordinates.altitude, 'number')
	t.ok(a.coordinates.altitude >= 0)
	t.ok(a.coordinates.altitude < 100000)
	t.equal(typeof a.timezone, 'string') // todo: validate
	if (a.country) t.equal(typeof a.country, 'string') // todo: validate
}

const isValidISODate = (d) => !Number.isNaN(+new Date(d))

test('fetchFromRadar', async (t) => {
	const flights = await fetchFromRadar(50.5, 8.5, 50, 9)
	{
		t.ok(Array.isArray(flights))
		if (!flights[0]) throw new Error('no flights found')

		for (let flight of flights) {
			t.ok(flight)
			if (flight.id !== null) {
				t.equal(typeof flight.id, 'string') // todo: validate IATA code
			}
			t.equal(typeof flight.registration, 'string')
			if (flight.flight !== null) {
				t.equal(typeof flight.flight, 'string')
			}
			t.equal(typeof flight.callsign, 'string')
			if (flight.origin !== null) {
				t.equal(typeof flight.origin, 'string')
			}
			if (flight.destination !== null) {
				t.equal(typeof flight.destination, 'string')
			}
			t.equal(typeof flight.latitude, 'number')
			t.equal(typeof flight.longitude, 'number')
			t.equal(typeof flight.altitude, 'number')
			t.equal(typeof flight.bearing, 'number')
			if (flight.speed !== null) {
				t.equal(typeof flight.speed, 'number')
			}
			if (flight.rateOfClimb !== null) {
				t.equal(typeof flight.rateOfClimb, 'number')
			}
			t.equal(typeof flight.isOnGround, 'boolean')
			t.equal(typeof flight.squawkCode, 'string')
			if (flight.model !== null) {
				t.equal(typeof flight.model, 'string')
			}
			t.equal(typeof flight.modeSCode, 'string')
			t.equal(typeof flight.radar, 'string')
			t.equal(typeof flight.isGlider, 'boolean')
			t.equal(typeof flight.timestamp, 'number')
		}
	}

	t.end()
})

test('fetchFlight', async (t) => {
	const flights = await fetchFromRadar(50.5, 8.5, 50, 9)
	{
		t.ok(Array.isArray(flights))
		if (!flights[0]) throw new Error('no flights found')

		t.ok(flights[0])
		t.ok(flights[0].id)
	}

	const flight = await fetchFlight(flights[0].id)
	{
		t.ok(flight)

		t.equal(typeof flight.liveData, 'boolean')
		t.equal(typeof flight.id, 'string') // todo: validate IATA code
		t.equal(typeof flight.callsign, 'string')
		if (flight.model) t.equal(typeof flight.model, 'string')
		t.equal(typeof flight.registration, 'string')
		if (flight.airline) {
			t.equal(typeof flight.airline, 'string')
			// todo: validate IATA code
		}

		if (flight.origin) validateAirport(t, flight.origin)
		if (flight.destination) validateAirport(t, flight.destination)

		if (flight.departure) {
			t.ok(isValidISODate(flight.departure))
			// todo: validate timezone
		}
		if (flight.scheduledDeparture) {
			t.ok(isValidISODate(flight.scheduledDeparture))
			// todo: validate timezone
		}
		if (flight.departureTerminal) {
			t.equal(typeof flight.departureTerminal, 'string')
		}
		if (flight.departureGate) {
			t.equal(typeof flight.departureGate, 'string')
		}

		if (flight.arrival) {
			t.ok(isValidISODate(flight.arrival))
			// todo: validate timezone
		}
		if (flight.scheduledArrival) {
			t.ok(isValidISODate(flight.scheduledArrival))
			// todo: validate timezone
		}
		if (flight.arrivalTerminal) {
			t.equal(typeof flight.arrivalTerminal, 'string')
		}
		if (flight.arrivalGate) {
			t.equal(typeof flight.arrivalGate, 'string')
		}
		if (flight.delay !== null) t.equal(typeof flight.delay, 'number')

		if (flight.trail !== null) {
			t.ok(Array.isArray(flight.trail))

			for (let trail of flight.trail) {
				t.ok(trail)
				if (trail.latitude !== null) {
					t.equal(typeof trail.latitude, 'number')
				}
				if (trail.longitude !== null) {
					t.equal(typeof trail.longitude, 'number')
				}
				if (trail.altitude !== null) {
					t.equal(typeof trail.altitude, 'number')
				}
				if (trail.bearing !== null) {
					t.equal(typeof trail.bearing, 'number')
				}
				if (trail.speed !== null) {
					t.equal(typeof trail.speed, 'number')
				}
				if (trail.timestamp !== null) {
					t.equal(typeof trail.timestamp, 'number')
				}
			}
		}
	}
	t.end()
})
