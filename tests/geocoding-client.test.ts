import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { searchOpenMeteoLocations } from '@/services/location';

afterEach(() => {
  jest.useRealTimers();
});

describe('Open-Meteo geocoding client', () => {
  it('encodes the query and returns normalized candidates', async () => {
    const fetchImplementation = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 2988507,
            name: 'Paris',
            latitude: 48.85341,
            longitude: 2.3488,
            admin1: 'Île-de-France',
            country: 'Pháp',
          },
        ],
      }),
    }));

    const result = await searchOpenMeteoLocations('  Paris & Lyon  ', undefined, {
      fetchImplementation,
    });

    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.stringContaining('name=Paris%20%26%20Lyon'),
      expect.objectContaining({ signal: expect.any(Object) }),
    );
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 'open-meteo:2988507',
        label: 'Paris',
        context: 'Île-de-France · Pháp',
      }),
    );
  });

  it('classifies a native fetch failure as a recoverable network error', async () => {
    const fetchImplementation = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });

    await expect(
      searchOpenMeteoLocations('Paris', undefined, { fetchImplementation }),
    ).rejects.toMatchObject({
      name: 'LocationSearchError',
      code: 'network',
    });
  });

  it('aborts a slow search at the configured timeout', async () => {
    jest.useFakeTimers();
    const fetchImplementation = jest.fn(
      (_input: string, init: { readonly signal: AbortSignal }) =>
        new Promise<never>((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        }),
    );
    const search = searchOpenMeteoLocations('Paris', undefined, {
      fetchImplementation,
      timeoutMs: 25,
    });
    const expectation = expect(search).rejects.toMatchObject({
      name: 'LocationSearchError',
      code: 'timeout',
    });

    await jest.advanceTimersByTimeAsync(25);

    await expectation;
  });

  it('classifies provider throttling separately from connectivity failures', async () => {
    const fetchImplementation = jest.fn(async () => ({
      ok: false,
      status: 429,
      json: async () => ({}),
    }));

    await expect(
      searchOpenMeteoLocations('Paris', undefined, { fetchImplementation }),
    ).rejects.toMatchObject({
      name: 'LocationSearchError',
      code: 'rate_limit',
      status: 429,
    });
  });
});
