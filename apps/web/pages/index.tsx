import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import MLSSearch from '@/components/home/MLSSearch';
import MarketInsights from '@/components/home/MarketInsights';
import ServicesOverview from '@/components/home/ServicesOverview';
import AboutVirginia from '@/components/home/AboutVirginia';
import FeaturedNews from '@/components/home/FeaturedNews';
import LatestNews from '@/components/home/LatestNews';
import ContactSection from '@/components/home/ContactSection';

export default function Home() {
  return (
    <Layout
      title="Virginia Hodges - Your Trusted Real Estate Expert in Southern California"
      description="Find your dream home with Virginia Hodges, your trusted real estate expert serving Moreno Valley, Riverside, Corona, Brea, and Fullerton. Expert guidance, local knowledge, and personalized service."
    >
      <HeroSection />
      <FeaturedProperties />
      <MLSSearch />
      <MarketInsights />
      <ServicesOverview />
      <AboutVirginia />
      <FeaturedNews />
      <LatestNews />
      <ContactSection />
    </Layout>
  );
}