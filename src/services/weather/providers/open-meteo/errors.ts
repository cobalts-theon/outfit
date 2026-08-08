export class OpenMeteoResponseError extends Error {
  constructor(
    message: string,
    readonly path?: string,
  ) {
    super(path === undefined ? message : `${path}: ${message}`);
    this.name = 'OpenMeteoResponseError';
  }
}

export class OpenMeteoHttpError extends Error {
  constructor(readonly status: number) {
    super(`Open-Meteo request failed with HTTP ${status}.`);
    this.name = 'OpenMeteoHttpError';
  }
}
