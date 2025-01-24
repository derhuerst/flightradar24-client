declare module 'flightradar24-client' {
  type FlightResponse = Record<string, unknown>;
  type FlightRadarResponse = Record<string, unknown>;

  function fetchFlight(flight: string): Promise<FlightResponse[]>;

  function fetchFromRadar(
    north: number,
    west: number,
    south: number,
    east: number,
    when?: number,
    options?: Record<string, unknown>
  ): Promise<FlightRadarResponse[]>;
}
