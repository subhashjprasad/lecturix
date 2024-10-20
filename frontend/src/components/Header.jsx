import React from 'react';
import LoginButton from './LoginButton';
import { Link } from 'react-router-dom'; // Import Link for routing


const Header = () => {
  return (
    <header
      className="flex flex-wrap justify-between py-2 pl-11 w-full tracking-wider text-right text-black uppercase whitespace-nowrap bg-[#dedde4] max-md:pl-5 max-md:max-w-full"
      style={{ fontFamily: 'Lucida Console, monospace' }}
    >
      <a className="my-4"href="/"><div className="my-auto text-xl font-bold leading-none">Lecturix</div></a>
      <nav className="flex text-l leading-none">
      <Link to="/about">
          <button className="my-auto bg-black text-white px-4 my-3 mr-2 py-2 rounded-md hover:bg-gray-600 transition duration-300">
            About
          </button>
        </Link>
        <LoginButton />
      </nav>
    </header>
  );
};

export default Header;