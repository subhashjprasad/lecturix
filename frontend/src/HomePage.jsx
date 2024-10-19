import React from 'react';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import Layout from './components/Layout';


const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <ProblemSolution />
    </Layout>
  );
};

export default HomePage;