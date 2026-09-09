import Link from 'next/link';

interface Props {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, any>;
}

const DEFAULT_SLOGANS = [
  'A BRAND OF MAGIC THAT NEVER FAILS',
  'BRAND IDENTITY',
  'WEB & DIGITAL',
  '3D DESIGN',
  'AI AUTOMATION',
  'EVENT PLANNING',
];

export default function Hero({ title, subtitle, content }: Props) {
  const eyebrow = content?.eyebrow || 'Cairo, Egypt · Est. 2022';
  const headline = title || 'Bold Ideas, Real Results';
  const sub =
    subtitle ||
    'A full-service creative studio building brands, digital experiences, 3D visuals, AI systems, and unforgettable events — for teams that refuse to be ordinary.';

  const iconUrl = content?.icon_url || '/ICON_VERSION.png';
  const primaryCtaText = content?.primary_cta_text || 'See Our Work';
  const primaryCtaUrl = content?.primary_cta_url || '#work';
  const secondaryCtaText = content?.secondary_cta_text || 'Start a Project';
  const secondaryCtaUrl = content?.secondary_cta_url || '#contact';

  const rawSlogans =
    content?.slogan_items && content.slogan_items.length > 0
      ? content.slogan_items
      : DEFAULT_SLOGANS;

  const repeated = [...rawSlogans, ...rawSlogans, ...rawSlogans];

  // Split headline words to preserve rich animated word styling
  const words = headline.split(' ');

  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-inner">
        <div className="hero-icon">
          <img src={iconUrl} alt="Genie" />
        </div>

        <div className="hero-eyebrow">{eyebrow}</div>

        <h1 className="hero-headline">
          {words.map((word, i) => (
            <span key={i}>
              <span className="word">{word}</span>
              {i < words.length - 1 && <>&nbsp;</>}
            </span>
          ))}
        </h1>

        <p className="hero-sub">{sub}</p>

        <div className="hero-actions">
          <Link className="btn-primary" href={primaryCtaUrl}>
            {primaryCtaText}
          </Link>
          <Link className="btn-ghost" href={secondaryCtaUrl}>
            {secondaryCtaText}
          </Link>
        </div>
      </div>

      <div className="slogan-strip">
        <div className="slogan-track">
          {repeated.map((item, i) => (
            <span key={i}>
              <span className="slogan-item">{item}</span>
              <span className="slogan-dot">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
