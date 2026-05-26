import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getNextTypewriterIndex,
  getTypewriterContent,
  startTypewriterInterval,
} from './useTypewriter';

describe('getNextTypewriterIndex', () => {
  it('resets to zero when the streaming content is cleared', () => {
    expect(getNextTypewriterIndex(12, '')).toBe(0);
  });

  it('advances one character at a time for short queues', () => {
    expect(getNextTypewriterIndex(3, 'hello')).toBe(4);
  });

  it('jumps ahead adaptively for large queues', () => {
    const content = 'a'.repeat(103);

    expect(getNextTypewriterIndex(0, content)).toBe(5);
  });

  it('clamps the next index to the content length', () => {
    expect(getNextTypewriterIndex(102, 'a'.repeat(103))).toBe(103);
  });

  it('stops advancing once the full content is already visible', () => {
    expect(getNextTypewriterIndex(5, 'hello')).toBe(5);
  });
});

describe('getTypewriterContent', () => {
  it('flushes to the full message as soon as streaming stops', () => {
    expect(getTypewriterContent('Hello world', false, 3)).toBe('Hello world');
  });

  it('returns an empty string while streaming an empty message', () => {
    expect(getTypewriterContent('', true, 10)).toBe('');
  });

  it('returns only the displayed prefix while streaming', () => {
    expect(getTypewriterContent('Hello world', true, 5)).toBe('Hello');
  });
});

describe('startTypewriterInterval', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('schedules repeated ticks on the typewriter cadence', () => {
    const setIntervalMock = vi.fn(() => 123);
    const tick = vi.fn();

    vi.stubGlobal('setInterval', setIntervalMock);

    startTypewriterInterval(tick);

    expect(setIntervalMock).toHaveBeenCalledOnce();
    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 30);
  });

  it('runs the provided tick from the scheduled callback', () => {
    const setIntervalMock = vi.fn<(handler: TimerHandler, timeout?: number) => number>();
    const tick = vi.fn();

    vi.stubGlobal('setInterval', setIntervalMock.mockImplementation(() => 123));

    startTypewriterInterval(tick);

    const scheduledTick = setIntervalMock.mock.calls[0]?.[0];
    expect(typeof scheduledTick).toBe('function');

    (scheduledTick as () => void)();

    expect(tick).toHaveBeenCalledOnce();
  });

  it('clears the scheduled interval during cleanup', () => {
    const setIntervalMock = vi.fn(() => 123);
    const clearIntervalMock = vi.fn();

    vi.stubGlobal('setInterval', setIntervalMock);
    vi.stubGlobal('clearInterval', clearIntervalMock);

    const cleanup = startTypewriterInterval(() => {});
    cleanup();

    expect(clearIntervalMock).toHaveBeenCalledWith(123);
  });
});
