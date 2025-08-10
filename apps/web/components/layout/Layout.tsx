import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

export default function Layout({
  children,
  title = 'Virginia Hodges - Real Estate Expert in Southern California',
  description = 'Find your dream home in Moreno Valley, Riverside, Corona, Brea, and Fullerton with Virginia Hodges. Expert real estate services with personalized attention.',
  canonical,
  noindex = false,
}: LayoutProps) {
  const fullTitle = title.includes('Virginia Hodges') ? title : `${title} | Virginia Hodges Real Estate`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:site_name" content="Virginia Hodges Real Estate" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/images/twitter-image.jpg" />
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* SEO */}
        {noindex && <meta name="robots" content="noindex,nofollow" />}
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Virginia Hodges',
              description: 'Expert real estate services in Southern California',
              url: 'https://askforvirginia.com',
              telephone: '(951) 555-0123',
              email: 'virginia@askforvirginia.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Moreno Valley',
                addressRegion: 'CA',
                addressCountry: 'US',
              },
              areaServed: [
                'Moreno Valley, CA',
                'Riverside, CA', 
                'Corona, CA',
                'Brea, CA',
                'Fullerton, CA'
              ],
              knowsAbout: [
                'Real Estate',
                'Home Buying',
                'Home Selling',
                'Property Investment',
                'Market Analysis'
              ],
              sameAs: [
                // Add social media links here
              ]
            })
          }}
        />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}