
'use client';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import type { HeroMediaConfig } from '@/lib/types';

const MediaBackground = ({ url, fileType }: { url: string; fileType: 'image' | 'video' }) => (
    <>
      {fileType === 'image' ? (
        <Image src={url} alt="Hero background" fill className="object-cover" />
      ) : (
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </>
  );

export default function MediaCarousel({ mediaConfig }: { mediaConfig: HeroMediaConfig }) {
    if (!mediaConfig || !mediaConfig.mediaItems || mediaConfig.mediaItems.length === 0) {
        return null;
    }
    
    return (
        <div className="relative w-full h-full bg-black">
           <Carousel
               opts={{ loop: true }}
               plugins={[Autoplay({ delay: 5000 })]}
               className="h-full"
           >
               <CarouselContent className="h-full">
                   {mediaConfig.mediaItems.map((url, index) => (
                       <CarouselItem key={index} className="h-full">
                          <MediaBackground url={url} fileType={mediaConfig.fileType || 'image'} />
                       </CarouselItem>
                   ))}
               </CarouselContent>
           </Carousel>
       </div>
   )
}
