'use strict'

const fetchFromRadar = require('./lib/radar')
const fetchFlight = require('./lib/flight')

fetchFromRadar(53, 13, 52, 14)
.then((flights) => {
	const id = flights[0].id
	console.log(id)
	return fetchFlight(id)
})
.then((flight) => {
	console.log(flight)
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
