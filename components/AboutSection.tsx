interface Props {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, any>;
}

const DEFAULT_TAGS = [
  'Brand Identity',
  'Art Direction',
  'UI / UX',
  'Web Dev',
  '3D & Motion',
  'AI Systems',
  'Events',
  'Marketing',
];

export default function AboutSection({ title, subtitle, content }: Props) {
  const sectionLabel = content?.section_label || 'About Genie Studio';
  const headline = title || 'Built on clarity, craft, and imagination';
  const sub =
    subtitle ||
    'Genie Studio is a creative powerhouse that partners with ambitious brands to deliver identities, digital experiences, and campaigns that leave a lasting mark.';
  const body =
    content?.body ||
    'From brand strategy and visual identity to web development, 3D production, AI automation, and event planning — we bring every idea to life with precision and purpose.';
  const visualText = content?.visual_text || 'Est. 2022 · Cairo, Egypt';
  const iconUrl = content?.icon_url || '/ICON_VERSION.png';

  const tags =
    content?.tags && Array.isArray(content.tags) && content.tags.length > 0
      ? content.tags
      : DEFAULT_TAGS;

  return (
    <section className="about-section">
      <div className="about-visual reveal">
        <div className="about-visual-inner">
          <div className="about-icon-lg">
            <img
              src={iconUrl}
              alt="Genie"
              width="140"
              height="140"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="about-visual-text">{visualText}</div>
        </div>
      </div>

      <div>
        <div
          className="section-label reveal"
          style={{ transitionDelay: '.1s' }}
        >
          {sectionLabel}
        </div>
        <h2
          className="section-headline reveal"
          style={{ transitionDelay: '.2s' }}
        >
          {headline}
        </h2>
        <p
          className="section-sub reveal"
          style={{ transitionDelay: '.3s' }}
        >
          {sub}
        </p>
        <p
          className="reveal"
          style={{
            fontSize: '.9rem',
            color: 'var(--lgray)',
            lineHeight: '1.8',
            maxWidth: '520px',
            marginBottom: '2rem',
            transitionDelay: '.4s',
          }}
        >
          {body}
        </p>
        <div className="about-tags reveal">
          {tags.map((tag: string) => (
            <span key={tag} className="about-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
