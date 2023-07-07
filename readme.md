# flightradar24-client

**Fetch aircraft data from [Flightradar24](https://www.flightradar24.com/).** Inofficial.

[![npm version](https://img.shields.io/npm/v/flightradar24-client.svg)](https://www.npmjs.com/package/flightradar24-client)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/flightradar24-client.svg)
![minimum Node.js version](https://img.shields.io/node/v/flightradar24-client.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install flightradar24-client
```


## Usage

### `radar(north, west, south, east)`

The four parameters represent a geographical bounding box (in decimal degrees) with:

* `north`: Northern edge latitude
* `west`: Western edge longitude
* `south`: Southern edge latitude
* `east`: Eastern edge longitude

```js
import {fetchFromRadar} from 'flightradar24-client'

const flights = await fetchFromRadar(53, 13, 52, 14)
console.log(flights)
```

```js
[
	{
		id: '10a6b765',
		registration: 'EI-EGD',
		flight: 'FR8544',
		callsign: 'RYR9XK', // ICAO ATC call signature
		origin: 'STN', // airport IATA code
		destination: 'SXF', // airport IATA code

		latitude: 52.7044,
		longitude: 13.4576,
		altitude: 8800, // in feet
		bearing: 106, // in degrees
		speed: 290, // in knots
		rateOfClimb: -1216, // in ft/min
		isOnGround: false,

		squawkCode: '0534', // https://en.wikipedia.org/wiki/Transponder_(aeronautics)
		model: 'B738', // ICAO aircraft type designator
		modeSCode: '4CA8AF', // ICAO aircraft registration number
		radar: 'T-EDDT1', // F24 "radar" data source ID
		isGlider: false,

		timestamp: 1520538174,
	}
	// …
]
```

### `flight(id)`

You may use the `id` from one of the results above to query more details. The output will roughly look like the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
import {fetchFlight} from 'flightradar24-client'

const flight = await fetchFlight('e3147c6')
console.log(flight)
```

```js
{
	id: 'e314807',
	callsign: 'BER839C',
	liveData: true,
	model: 'A320',
	registration: 'D-ABDT',
	airline: 'AB',
	origin: {
		id: 'TXL',
		name: 'Berlin Tegel Airport',
		coordinates: {latitude: 52.560001, longitude: 13.288, altitude: 122},
		timezone: 'Europe/Berlin',
		country: 'DEU',
	},
	destination: {
		id: 'GOT',
		name: 'Gothenburg Landvetter Airport',
		coordinates: {latitude: 57.66283, longitude: 12.27981, altitude: 506},
		timezone: 'Europe/Stockholm',
		country: 'SWE',
	},
	departure: '2017-07-22T17:15:00+02:00',
	scheduledDeparture: '2017-07-22T17:15:00+02:00',
	departureTerminal: null,
	departureGate: 'C40',
	arrival: '2017-07-22T18:35:00+02:00',
	scheduledArrival: '2017-07-22T18:35:00+02:00',
	arrivalTerminal: null,
	arrivalGate: '19A',
	delay: 1757,
}
```


## Related

- [MMM-FlightsAbove](https://github.com/E3V3A/MMM-FlightsAbove#magicmirror-module-flightsabove) – A [MagicMirror](https://magicmirror.builders) Module for using displaying current flights in the sky above you!


## Contributing

If you have a question or have difficulties using `flightradar24-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/flightradar24-client/issues).
