# flightradar24-client

**Fetch aircraft data from [Flightradar24](https://www.flightradar24.com/).** Inofficial.

[![npm version](https://img.shields.io/npm/v/flightradar24-client.svg)](https://www.npmjs.com/package/flightradar24-client)
[![build status](https://img.shields.io/travis/derhuerst/flightradar24-client.svg)](https://travis-ci.org/derhuerst/flightradar24-client)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/flightradar24-client.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


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
const radar = require('flightradar24-client/lib/radar')

radar(53, 13, 52, 14)
.then(console.log)
.catch(console.error)
```

```js
[
	{
		id: 'e3146d4',
		registration: 'D-MAKD',
		flight: null,
		callsign: 'DMAKD',
		origin: null,
		destination: null,
		latitude: 52.5352,
		longitude: 12.9761,
		altitude: 2100, // in feet
		bearing: 84, // in degrees
		speed: 101, // in knots
		model: null,
		modeSCode: '3FED5C',
		radar: 'T-MLAT1'
	}, {
		id: 'e3147c6',
		registration: 'G-ECOI',
		flight: 'SN2588',
		callsign: 'BEL88T',
		origin: 'TXL',
		destination: 'BRU',
		latitude: 52.5947,
		longitude: 13.1046,
		altitude: 14815, // in feet
		bearing: 262, // in degrees
		speed: 246, // in knots
		model: 'DH8D',
		modeSCode: '405E66',
		radar: 'T-MLAT1'
	}
	// …
]
```

### `flight(id)`

You may use the `id` from one of the results above to query more details. The output will roughly look like the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
const flight = require('flightradar24-client/lib/flight')

flight('e3147c6')
.then(console.log)
.catch(console.error)
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
		country: 'DEU'
	},
	destination: {
		id: 'GOT',
		name: 'Gothenburg Landvetter Airport',
		coordinates: {latitude: 57.66283, longitude: 12.27981, altitude: 506},
		timezone: 'Europe/Stockholm',
		country: 'SWE'
	},
	departure: '2017-07-22T17:15:00+02:00',
	scheduledDeparture: '2017-07-22T17:15:00+02:00',
	departureTerminal: null,
	departureGate: 'C40',
	arrival: '2017-07-22T18:35:00+02:00',
	scheduledArrival: '2017-07-22T18:35:00+02:00',
	arrivalTerminal: null,
	arrivalGate: '19A',
	delay: 1757
}
```


## Contributing

If you have a question or have difficulties using `flightradar24-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/flightradar24-client/issues).
