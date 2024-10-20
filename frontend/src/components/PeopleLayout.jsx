import React from 'react';
import Sidebar from './RetractingSideBar'

const PeopleLayout = ({ children }) => {
  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default PeopleLayout;