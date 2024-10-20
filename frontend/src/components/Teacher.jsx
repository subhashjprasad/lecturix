import React, { useRef } from "react";
import TiltCard from './TiltCard.jsx';
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import PeopleLayout from "./PeopleLayout.jsx";
import HoverDevCards from "./HoverDevCards.jsx";

// Teacher component
const Teacher = () => {
  return (
    <PeopleLayout>
      <TiltCard />
      <HoverDevCards />
    </PeopleLayout>
  );
};


export default Teacher;


// const Teacher = ({ setFolderClicked }) => {
//   const handleFolderClick = () => {
//     // Logic for when a folder is clicked
//     setFolderClicked(true);
//   };

//   return (
//     <PeopleLayout>
//       <TiltCard />
//       <HoverDevCards />
//     </PeopleLayout>
//   );
// };

// export default Teacher;
