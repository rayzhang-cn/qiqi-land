import { useState } from 'react';
import { useProfilesStore } from '../stores/profiles';
import type { AgeBand } from '../types';

const AVATARS = ['🦖', '🐰', '🤖'];
const AGE_BANDS: AgeBand[] = ['3-4', '5-6'];

export function ProfileSelect({ onEnter }: { onEnter: () => void }) {
  const profiles = useProfilesStore((s) => s.profiles);
  const setActive = useProfilesStore((s) => s.setActive);
  const addProfile = useProfilesStore((s) => s.addProfile);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [ageBand, setAgeBand] = useState<AgeBand>('3-4');

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = addProfile({ name: name.trim(), avatar, ageBand });
    setActive(id);
    onEnter();
  };

  return (
    <div className="profile-select">
      <h1 className="app-title">奇奇乐园</h1>
      <div className="profile-list">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="profile-button"
            onClick={() => {
              setActive(p.id);
              onEnter();
            }}
          >
            <span className="profile-avatar">{p.avatar}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className="profile-create">
        <input
          aria-label="名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的名字"
        />
        <div role="radiogroup" aria-label="头像" className="option-row">
          {AVATARS.map((a) => (
            <button key={a} aria-label={`头像${a}`} aria-pressed={avatar === a} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="年龄" className="option-row">
          {AGE_BANDS.map((b) => (
            <button key={b} aria-pressed={ageBand === b} onClick={() => setAgeBand(b)}>
              {b}岁
            </button>
          ))}
        </div>
        <button className="big-button" onClick={handleCreate}>
          开始玩
        </button>
      </div>
    </div>
  );
}