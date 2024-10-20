import React, { useRef } from "react";
import TiltCard from './TiltCard.jsx';
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import PeopleLayout from "./PeopleLayout.jsx";
import HoverDevCards from "./HoverDevCards.jsx";

// Teacher component
const LecVids = () => {
  return (
    <PeopleLayout>
      <HoverDevCards />
    </PeopleLayout>
  );
};


export default LecVids;