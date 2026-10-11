import { toChars } from './poemText';

describe('toChars', () => {
  it('按字拆分诗句', () => {
    expect(toChars('床前明月光')).toEqual(['床', '前', '明', '月', '光']);
  });

  it('去除标点后再拆分', () => {
    expect(toChars('敕勒川，阴山下')).toEqual(['敕', '勒', '川', '阴', '山', '下']);
  });
});
