'use strict'

const fetchFromRadar = require('./lib/radar')
const fetchFlight = require('./lib/flight')

const flights = await fetchFromRadar(53, 13, 52, 14)
const id = flights[0].id

const flight = await fetchFlight(id)
console.log(flight)
