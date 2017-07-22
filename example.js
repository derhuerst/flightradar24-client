'use strict'

const radar = require('./lib/radar')
const flight = require('./lib/flight')

radar(53, 13, 52, 14)
.then((flights) => {
	const id = flights[0].id
	console.log(id)
	return flight(id)
})
.then((flight) => {
	console.log(flight)
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
