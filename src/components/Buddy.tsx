export function Buddy({ avatar, text }: { avatar: string; text: string }) {
  return (
    <div className="buddy">
      <span className="buddy-avatar" role="img" aria-label="伙伴">
        {avatar}
      </span>
      {text && <div className="buddy-bubble">{text}</div>}
    </div>
  );
}