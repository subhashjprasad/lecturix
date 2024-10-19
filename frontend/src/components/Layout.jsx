import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col rounded-none">
      <div className="flex flex-col pb-52 w-full bg-cyan-900 max-md:pb-24 max-md:max-w-full">
        <Header />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;