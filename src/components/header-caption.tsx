
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { UiConfig } from '@/lib/types';

interface HeaderCaptionProps {
  config: UiConfig | null;
}

export default function HeaderCaption({ config }: HeaderCaptionProps) {
  if (!config) return null;

  const { headerCaptionType, headerCaptionStatic, headerCaptionCarousel } = config;

  if (headerCaptionType === 'carousel' && headerCaptionCarousel && headerCaptionCarousel.length > 0) {
    return (
      <div className="bg-primary text-primary-foreground text-center text-sm p-2 font-headline">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full max-w-xs mx-auto"
        >
          <CarouselContent>
            {headerCaptionCarousel.map((item, index) => (
              <CarouselItem key={index}>
                <div>{item}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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
