import React from 'react';
import HeroSection from '../components/home/HeroSection.jsx';
import PropertySearch from '../components/home/PropertySearch.jsx';
import StatsCounter from '../components/home/StatsCounter.jsx';
import FeaturedProperties from '../components/home/FeaturedProperties.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import CompanyTimeline from '../components/home/CompanyTimeline.jsx';
import ClientsSection from '../components/home/ClientsSection.jsx';
import InvestmentExpansion from '../components/home/InvestmentExpansion.jsx';
import Project101Section from '../components/home/Project101Section.jsx';
import MapSection from '../components/home/MapSection.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import ContactCTA from '../components/home/ContactCTA.jsx';

const HomePage = () => (
  <>
    <HeroSection />
    <PropertySearch />
    <StatsCounter />
    <FeaturedProperties />
    <AboutSection />
    <ServicesSection />
    <WhyChooseUs />
    <CompanyTimeline />
    <ClientsSection />
    <InvestmentExpansion />
    <Project101Section />
    <MapSection />
    <Testimonials />
    <NewsSection />
    <ContactCTA />
  </>
);

export default HomePage;
