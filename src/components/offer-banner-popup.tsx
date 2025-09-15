
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import type { UiConfig } from '@/lib/types';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface OfferBannerPopupProps {
  config?: UiConfig['offerBanner'];
}

export default function OfferBannerPopup({ config }: OfferBannerPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (config?.enabled && config?.images && config.images.length > 0) {
      const hasSeenBanner = sessionStorage.getItem('hasSeenOfferBanner');
      if (!hasSeenBanner) {
        setOpen(true);
        sessionStorage.setItem('hasSeenOfferBanner', 'true');
      }
    }
  }, [config]);

  if (!config?.enabled || !config.images || config.images.length === 0) {
    return null;
  }

  const isCarousel = config.images.length > 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 border-0 max-w-lg">
        <div className="relative">
          {isCarousel ? (
            <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000 })]}>
              <CarouselContent>
                {config.images.map((url, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={url}
                      alt={`Offer Banner ${index + 1}`}
                      width={600}
                      height={600}
                      className="w-full h-auto aspect-square object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <Image
              src={config.images[0]}
              alt="Offer Banner"
              width={600}
              height={600}
              className="w-full h-auto aspect-square object-cover rounded-lg"
            />
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setOpen(false)}
            aria-label="Close offer banner"
            >
              <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
