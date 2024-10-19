import React from 'react';

const Header = () => {
  return (
    <header
      className="flex flex-wrap justify-between py-2 pl-11 w-full tracking-wider text-right text-black uppercase whitespace-nowrap bg-[#dedde4] max-md:pl-5 max-md:max-w-full"
      style={{ fontFamily: 'Lucida Console, monospace' }}
    >
      <div className="my-auto text-xl font-bold leading-none">Lecturix</div>
      <nav className="flex text-l leading-none">
        <a href="#about" className="my-auto">About</a>
        <img loading="lazy" src="google.png" alt="" className="object-contain shrink-0 aspect-[4.37] w-[175px]" />
      </nav>
    </header>
  );
};

export default Header;
