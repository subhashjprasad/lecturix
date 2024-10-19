import React, { useEffect, useRef } from 'react';
import './ProblemSolution.css'; // Import the CSS file for animations

const ProblemSolution = () => {
  const problemRef = useRef(null);
  const solutionRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      threshold: 0.1, // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add the slide-in-right class when the section comes into view
          entry.target.classList.add('slide-in-right');
        }
      });
    }, options);

    if (problemRef.current) {
      observer.observe(problemRef.current);
    }
    if (solutionRef.current) {
      observer.observe(solutionRef.current);
    }

    return () => {
      if (problemRef.current) observer.unobserve(problemRef.current);
      if (solutionRef.current) observer.unobserve(solutionRef.current);
    };
  }, []);

  return (
    <div>
      {/* Full-screen Problem section */}
      <section className="relative flex flex-col justify-center items-center h-screen w-full bg-[#dedde4] px-10 py-12 text-center">
        <div ref={problemRef} >
          {/* The Problem heading with outline */}
          <h2 className="text-6xl md:text-8xl text-[#dedde4] font-bold uppercase problem-heading mb-8">
            The Problem
          </h2>
          
          {/* Problem Details */}
          <p className="text-2xl md:text-4xl leading-snug text-slate-700">
            Students, have you ever missed a class before and not have any material to learn from?
            <br />
            Professors, have you ever just wanted to turn your notes into videos for students to have supplementary resources?
          </p>
        </div>
      </section>

    </div>
  );
};
{/*

  <div ref={solutionRef}>
    <p className="mt-9 text-2xl leading-6 text-slate-500 max-md:max-w-full">
      Create lecture videos from the professor's lecture notes!
      <br />
      Students: Access lecture videos at your will
      <br />
      Professors: Create videos for students quickly with 0 effort
    </p>
  </div>


*/}

export default ProblemSolution;
