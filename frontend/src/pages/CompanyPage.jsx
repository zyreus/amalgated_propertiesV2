import React from 'react';
import About from '../components/About.jsx';
import PartnersAndTenants from '../components/PartnersAndTenants.jsx';

const CompanyPage = () => (
  <>
    <div data-animate className="ap-section pt-8">
      <About />
    </div>
    <div data-animate className="ap-section">
      <PartnersAndTenants />
    </div>
  </>
);

export default CompanyPage;
