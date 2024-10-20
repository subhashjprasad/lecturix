import React, { useEffect, useRef } from 'react';
import './Solution.css'; // Import the CSS file for animations


const Solution = () => {
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
          entry.target.classList.add('slide-in-left');
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
    <div className="grid grid-cols-2 gap-x-10 gap-y-14 px-20 py-12 w-full bg-[#dedde4]">
      {/* Row 2: Left - Details and Video */}
      <div ref={solutionRef} className="flex flex-col items-start">
        {/* Text on top */}
        <p className="text-2xl md:text-2xl leading-snug text-slate-700 mb-4" style={{ fontFamily: 'Lucida Console, monospace' }}>
          Create lecture videos from class lecture notes!
        </p>
        {/* Video below */}
        <video width="600" controls>
          <source src="https://youtu.be/P8GujiW2kBM" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Right side content */}
      <div ref={problemRef} className="flex items-center">
        <h2 className="text-6xl text-[#dedde4] md:text-8xl problem-heading font-bold uppercase mb-8 slide-in-left">
          The Solution
        </h2>
      </div>
    </div>
  );
  

  // return (
  //   <div className="grid grid-cols-2 gap-x-10 gap-y-14 px-20 py-12 w-full bg-[#dedde4]">
      
  //     {/* Row 2: Left - Details, Right - Solution */}
  //     <div ref={solutionRef} className="flex items-center">
  //       <p className="text-2xl md:text-2xl leading-snug text-slate-700" style={{ fontFamily: 'Lucida Console, monospace' }}>
  //       Create lecture videos from the professor's lecture videos!
  //       </p>
  //       <video width="600" controls>
  //         <source src="../../images/StatesOfMatter.mp4" type="video/mp4" />
  //         Your browser does not support the video tag.
  //       </video>
  //     </div>
  //     <div ref={problemRef} className="flex items-center">
  //     <h2 className="text-6xl text-[#dedde4] md:text-8xl problem-heading font-bold uppercase mb-8 slide-in-left">
  //       The Solution
  //     </h2>
        
  //     </div>
  //   </div>
  // );
};


export default Solution;



