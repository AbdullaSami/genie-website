import type { Service } from '@/types';

interface Props {
  services: Service[];
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, any>;
}

export default function ServicesGrid({ services, title, subtitle, content }: Props) {
  const label = content?.section_label || 'What We Do';
  const headline = title || 'Six ways we make magic happen';
  const sub =
    subtitle ||
    'From the first spark to the final pixel — we cover every creative discipline your brand needs to grow.';

  return (
    <section className="services-section" id="services">
      <div className="section-label reveal">{label}</div>
      <h2 className="section-headline reveal">{headline}</h2>
      <p className="section-sub reveal">{sub}</p>

      <div className="services-grid" id="servicesGrid">
        {services.map((s, i) => (
          <div
            key={s.id}
            className="service-card reveal"
            style={{ transitionDelay: `${(i * 0.08).toFixed(2)}s` }}
          >
            <span className="service-num">{s.number}</span>
            <div className="service-name">{s.name}</div>
            <div className="service-desc">{s.description}</div>
            <div className="service-tags">
              {s.tags.map((tag) => (
                <span key={tag} className="service-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
