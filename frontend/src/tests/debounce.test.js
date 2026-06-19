import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../utils/debounce';

describe('debounce utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call function immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls function after the wait period', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only fires once for rapid successive calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes the last set of arguments to the function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced('first');
    debounced('second');
    debounced('third');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('fires again after the wait period resets', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced('first');
    vi.advanceTimersByTime(300);
    debounced('second');
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses 300ms default wait time', () => {
    const fn = vi.fn();
    const debounced = debounce(fn);
    debounced();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
