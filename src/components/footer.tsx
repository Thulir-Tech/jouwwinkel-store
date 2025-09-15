
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { getUiConfig, getDeveloperConfig } from '@/lib/firestore';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

export default async function Footer() {
  const [uiConfig, devConfig] = await Promise.all([
      getUiConfig(),
      getDeveloperConfig()
  ]);

  return (
    <footer className="bg-stone-100 dark:bg-stone-900 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-headline mb-4">{uiConfig?.footerHeading}</h3>
            <p className="text-muted-foreground">{uiConfig?.footerCaption}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="/combos" className="text-muted-foreground hover:text-primary">Combos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li><Link href="/our-story" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href={uiConfig?.instagramLink || '#'} rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><InstagramIcon /></a>
              <a href={uiConfig?.whatsappLink || '#'} aria-label="WhatsApp" className="text-muted-foreground hover:text-primary"><FaWhatsapp size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
           {devConfig?.developedByName && (
             <p>
                Copyright &copy; {devConfig.developedByYear || new Date().getFullYear()} | Developed by <a href={devConfig.developedByLink || '#'} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{devConfig.developedByName}</a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
