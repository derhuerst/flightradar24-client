import {
	fetchFromRadar,
	fetchFlight,
} from './index.js'

const flights = await fetchFromRadar(53, 13, 52, 14)
const id = flights[0].id

const flight = await fetchFlight(id)
console.log(flight)
