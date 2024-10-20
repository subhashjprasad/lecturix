import React from 'react';

const Footer = () => {
  return (
    <footer className="flex justify-center items-center px-6 py-8 w-full bg-[#0f172a] text-white">
      <div className="flex justify-between items-start w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold">Lecturix</h2>
          <p className="mt-2 text-sm text-gray-400">Empowering learners worldwide</p>
        </div>
        
        <nav className="flex flex-col items-end">
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <a href="mailto:lecturix@gmail.com" className="text-sm hover:text-blue-400 transition-colors">
            lecturix@gmail.com
          </a>
          <a href="tel:+1234567890" className="text-sm mt-2 hover:text-blue-400 transition-colors">
            +1 (234) 567-890
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;