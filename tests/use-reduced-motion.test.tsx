import { afterEach, beforeEach, expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from '@/components/controls';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let observed: boolean;

let renderer: ReactTestRenderer;

const remove = jest.fn();

function Probe() {
  observed = useReducedMotion();
  return null;
}

beforeEach(() => {
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>);
});

afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  jest.restoreAllMocks();
  remove.mockClear();
});

it('starts conservatively and follows the OS setting and later changes', async () => {
  let resolve!: (value: boolean) => void;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(done => { resolve = done; }));
  await act(async () => { renderer = create(<Probe />); });
  expect(observed).toBe(true);
  await act(async () => resolve(false));
  expect(observed).toBe(false);
  const listener = jest.mocked(AccessibilityInfo.addEventListener).mock.calls[0][1] as unknown as (enabled: boolean) => void;
  await act(async () => listener(true));
  expect(observed).toBe(true);
});

it('keeps reduced motion enabled if the native setting cannot be read', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('unavailable'));
  await act(async () => { renderer = create(<Probe />); });
  expect(observed).toBe(true);
});

it('removes the native subscription before a pending setting resolves', async () => {
  let resolve!: (value: boolean) => void;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(new Promise(done => { resolve = done; }));
  await act(async () => { renderer = create(<Probe />); });
  await act(async () => renderer.unmount());
  expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => resolve(false));
  expect(observed).toBe(true);
});
