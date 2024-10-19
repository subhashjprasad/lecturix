import React from 'react';

const Footer = () => {
  return (
    <footer className="flex flex-col items-center px-16 pt-10 pb-28 w-full bg-cyan-900 max-md:px-5 max-md:pb-24 max-md:max-w-full">
      <div className="mb-0 ml-4 max-w-full w-[700px] max-md:mb-2.5">
        <div className="flex gap-5 max-md:flex-col">
          <div className="flex flex-col w-3/5 max-md:ml-0 max-md:w-full">
            <div className="flex gap-10 whitespace-nowrap max-md:mt-10">
              <div className="flex flex-col grow shrink-0 basis-0 w-fit">
                <div className="flex gap-5 justify-between max-w-full tracking-wide text-cyan-900 uppercase w-[219px]">
                  <span className="text-xs leading-none">Source</span>
                  <span className="text-xs leading-none">Outreach</span>
                </div>
                <h2 className="self-end mt-20 text-6xl text-white max-md:mt-10 max-md:text-4xl">
                  Lecturix
                </h2>
              </div>
              <span className="self-start text-xs tracking-wide leading-none text-cyan-900 uppercase">
                Connect
              </span>
            </div>
          </div>
          <nav className="flex flex-col ml-5 w-2/5 max-md:ml-0 max-md:w-full">
            <div className="flex grow gap-10 text-sm text-white max-md:mt-10">
              <div className="flex flex-col flex-1 items-start self-start leading-none whitespace-nowrap">
                <h3 className="self-stretch text-xs tracking-wide text-cyan-900 uppercase">
                  Interseller
                </h3>
                <a href="#about" className="mt-6 leading-none">About</a>
                <a href="#blog" className="mt-6 text-sm leading-none">Blog</a>
                <a href="#press" className="mt-5">Press</a>
              </div>
              <div className="flex flex-col flex-1 items-start">
                <h3 className="text-xs tracking-wide leading-none text-cyan-900 uppercase">
                  Resources
                </h3>
                <a href="#status" className="mt-6 leading-none">Status</a>
                <a href="#support" className="mt-6 leading-tight">Support</a>
                <a href="#terms" className="self-stretch mt-5 leading-none max-md:mr-1.5">
                  Terms of Use
                </a>
                <a href="#privacy" className="self-stretch mt-6 leading-none">
                  Privacy Policy
                </a>
                <a href="#anti-spam" className="mt-5 text-sm leading-none">Anti-Spam</a>
                <a href="#security" className="mt-5 leading-none">Security</a>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;