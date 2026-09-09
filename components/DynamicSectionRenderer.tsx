'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PageSection } from '@/types';

interface Props {
  section: PageSection;
}

export default function DynamicSectionRenderer({ section }: Props) {
  const { block_type, title, subtitle, content } = section;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (block_type === 'rich_text') {
    return (
      <section className="about-section !block py-16 px-[5vw] max-w-4xl mx-auto">
        {content.section_label && (
          <div className="section-label reveal mb-3">{content.section_label}</div>
        )}
        {title && <h2 className="section-headline reveal mb-4">{title}</h2>}
        {subtitle && <p className="section-sub reveal mb-8">{subtitle}</p>}
        <div
          className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-4 text-base [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-white [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>blockquote]:border-l-2 [&>blockquote]:border-[#00ABED] [&>blockquote]:pl-4 [&>blockquote]:italic [&>a]:text-[#00ABED] [&>a]:underline"
          dangerouslySetInnerHTML={{ __html: content.html || '' }}
        />
      </section>
    );
  }

  if (block_type === 'cta') {
    return (
      <section className="cta-section py-20 px-[5vw] text-center">
        {content.section_label && (
          <div className="section-label justify-center mb-3 text-white/40">{content.section_label}</div>
        )}
        <h2 className="section-headline text-white mb-4">{title || "Let's work together"}</h2>
        {subtitle && <p className="section-sub text-white/60 max-w-xl mx-auto mb-8">{subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {content.button_text && (
            <Link className="btn-primary" href={content.button_url || '#contact'}>
              {content.button_text}
            </Link>
          )}
          {content.secondary_button_text && (
            <Link className="btn-ghost" href={content.secondary_button_url || '#work'}>
              {content.secondary_button_text}
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (block_type === 'faq') {
    const items = content.items || [];
    return (
      <section className="services-section py-16 px-[5vw] max-w-4xl mx-auto">
        <div className="section-label reveal">{content.section_label || 'FAQ'}</div>
        <h2 className="section-headline reveal">{title || 'Frequently Asked Questions'}</h2>
        {subtitle && <p className="section-sub reveal mb-8">{subtitle}</p>}

        <div className="space-y-3 mt-8">
          {items.map((item: any, i: number) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-base font-semibold text-white">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#00ABED] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-white/70 leading-relaxed border-t border-white/5 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (block_type === 'features') {
    const items = content.items || [];
    return (
      <section className="services-section py-16 px-[5vw]">
        <div className="section-label reveal">{content.section_label || 'Highlights'}</div>
        <h2 className="section-headline reveal">{title || 'Why Choose Us'}</h2>
        {subtitle && <p className="section-sub reveal mb-8">{subtitle}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 hover:border-[#00ABED]/30 transition-all"
            >
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block_type === 'gallery') {
    const images = content.images || [];
    return (
      <section className="projects-section py-16 px-[5vw]">
        <div className="section-label reveal">{content.section_label || 'Gallery'}</div>
        <h2 className="section-headline reveal">{title || 'Visual Showcase'}</h2>
        {subtitle && <p className="section-sub reveal mb-8">{subtitle}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {images.map((img: any, i: number) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <img src={img.url} alt={img.alt || img.caption || 'Gallery image'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block_type === 'custom_html') {
    return (
      <section className="py-12 px-[5vw] max-w-6xl mx-auto">
        {title && <h2 className="section-headline mb-4">{title}</h2>}
        <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />
      </section>
    );
  }

  return null;
}
