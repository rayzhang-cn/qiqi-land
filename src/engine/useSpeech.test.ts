import { renderHook } from '@testing-library/react';
import { useSpeech } from './useSpeech';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useSpeech', () => {
  it('支持时调用 speechSynthesis 朗读中文', () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        lang = '';
        rate = 1;
        constructor(t: string) {
          this.text = t;
        }
      },
    );
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(true);
    result.current.speak('你好');
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe('你好');
  });

  it('不支持时静默跳过不报错（降级）', () => {
    // jsdom 默认没有 speechSynthesis
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(false);
    expect(() => result.current.speak('你好')).not.toThrow();
  });
});