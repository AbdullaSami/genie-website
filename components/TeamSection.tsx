import type { TeamMember } from '@/types';

interface Props {
  team: TeamMember[];
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, any>;
}

export default function TeamSection({ team, title, subtitle, content }: Props) {
  const label = content?.section_label || 'The Team';
  const headline = title || 'Meet the board';
  const sub = subtitle || 'The minds behind every idea, strategy, and pixel.';

  return (
    <section className="board-section">
      <div className="section-label reveal">{label}</div>
      <h2 className="section-headline reveal">{headline}</h2>
      <p className="section-sub reveal">{sub}</p>

      <div className="board-grid" id="boardGrid">
        {team.map((m, i) => (
          <div
            key={m.id}
            className="board-card reveal"
            style={{ transitionDelay: `${(i * 0.12).toFixed(2)}s` }}
          >
            <div className="board-photo">
              <img src={m.photo_url} alt={m.name} loading="lazy" />
            </div>
            <div className="board-role">{m.role}</div>
            <div className="board-name">{m.name}</div>
            <p className="board-bio">{m.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
