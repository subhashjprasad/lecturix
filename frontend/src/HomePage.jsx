import React, { useRef } from "react";
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Layout from './components/Layout';
import Solution from './components/Solution';
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

// Main HomePage component
const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <ProblemSolution />
      <Solution/>
    </Layout>
  );
};


export default HomePage;
