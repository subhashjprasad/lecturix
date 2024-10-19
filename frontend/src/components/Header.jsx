import React from 'react';

const Header = () => {
  return (
    <header className="flex flex-wrap justify-between py-4 pl-11 w-full font-bold tracking-wider text-right text-white uppercase whitespace-nowrap bg-gray-800 max-md:pl-5 max-md:max-w-full">
      <div className="my-auto text-xl leading-none">Lecturix</div>
      <nav className="flex text-sm leading-none">
        <a href="#about" className="my-auto">About</a>
        <img loading="lazy" src="google.png" alt="" className="object-contain shrink-0 aspect-[4.37] w-[175px]" />
      </nav>
    </header>
  );
};

export default Header;