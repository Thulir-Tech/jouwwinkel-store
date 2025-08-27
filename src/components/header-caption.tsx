
'use client';

import type { UiConfig } from '@/lib/types';
import { Fragment } from 'react';

interface HeaderCaptionProps {
  config: UiConfig | null;
}

export default function HeaderCaption({ config }: HeaderCaptionProps) {
  if (!config) return null;

  const { headerCaptionType, headerCaptionStatic, headerCaptionCarousel } = config;

  if (headerCaptionType === 'carousel' && headerCaptionCarousel && headerCaptionCarousel.length > 0) {
    const carouselItems = headerCaptionCarousel.filter(item => item.trim() !== '');
    if (carouselItems.length === 0) return null;
    
    // Duplicate the content to create a seamless loop
    const fullText = [...carouselItems, ...carouselItems];

    return (
      <div className="bg-primary text-primary-foreground text-center text-sm p-2 font-headline">
        <div className="marquee">
          <div className="marquee-content">
            {fullText.map((item, index) => (
                <Fragment key={index}>
                    <span className="mx-4">{item}</span>
                    {index < fullText.length - 1 && <span>|</span>}
                </Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (headerCaptionType === 'static' && headerCaptionStatic) {
    return (
      <div className="bg-primary text-primary-foreground text-center text-sm p-2 font-headline">
        {headerCaptionStatic}
      </div>
    );
  }

  return null;
}
