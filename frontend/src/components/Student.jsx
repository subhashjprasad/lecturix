import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import PeopleLayout from "./PeopleLayout.jsx";
import HoverDevCards from "./HoverDevCards.jsx";
import StudentTiltCard from './StudentTiltCard.jsx'

// Teacher component
const Student = () => {
  return (
    <PeopleLayout>
      <StudentTiltCard />
      <HoverDevCards />
    </PeopleLayout>
  );
};


export default Student;