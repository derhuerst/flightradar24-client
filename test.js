'use strict'

const test = require('tape')

const radar = require('./lib/radar')
const flight = require('./lib/flight')

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

test('radar', (t) => {
	radar(50.5, 8.5, 50, 9)
	.then((flights) => {
		t.ok(Array.isArray(flights))
		for (let flight of flights) {
			t.ok(flight)
			if (flight.id !== null) t.equal(typeof flight.id, 'string') // todo: validate IATA code
			t.equal(typeof flight.registration, 'string')
			if (flight.flight) t.equal(typeof flight.flight, 'string')
			t.equal(typeof flight.callsign, 'string')
			if (flight.origin) t.equal(typeof flight.origin, 'string')
			if (flight.destination) t.equal(typeof flight.destination, 'string')
			t.equal(typeof flight.latitude, 'number')
			t.equal(typeof flight.longitude, 'number')
			t.equal(typeof flight.altitude, 'number')
			t.equal(typeof flight.bearing, 'number')
			if (flight.speed !== null) t.equal(typeof flight.speed, 'number')
			if (flight.model) t.equal(typeof flight.model, 'string')
			t.equal(typeof flight.modeSCode, 'string')
			t.equal(typeof flight.radar, 'string')
		}
		t.end()
	})
	.catch(t.ifError)
})

test('flight', (t) => {
	radar(50.5, 8.5, 50, 9)
	.then((flights) => {
		t.ok(Array.isArray(flights))
		t.ok(flights[0])
		t.ok(flights[0].id)
		return flight(flights[0].id)
	})
	.then((flight) => {
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

		t.end()
	})
	.catch(t.ifError)
})
