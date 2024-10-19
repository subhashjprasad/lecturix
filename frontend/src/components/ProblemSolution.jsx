import React from 'react';

const ProblemSolution = () => {
  return (
    <section className="flex flex-col justify-center items-center px-20 py-12 w-full text-2xl tracking-wider text-center text-cyan-900 rounded bg-slate-100 max-md:px-5 max-md:max-w-full">
      <div className="flex flex-col items-center max-w-full w-[510px]">
        <h2 className="tracking-wider leading-none uppercase">The Problem</h2>
        <p className="self-stretch mt-9 text-sm leading-6 text-slate-500 max-md:max-w-full">
          Students, have you ever missed a class before and not have any material to learn from?
          <br />
          Professors, have you ever just wanted to turn your notes into videos for students to have supplementary resources?
        </p>
        <h2 className="mt-14 tracking-wider leading-none uppercase max-md:mt-10">The solution</h2>
        <p className="mt-11 text-sm leading-6 text-slate-500 max-md:mt-10">
          Create lecture videos from the professor's lecture videos!
          <br />
          Students: Access lecture videos at your will
          <br />
          Professors: Create videos for students quickly with 0 effort
        </p>
        <div className="overflow-hidden px-7 py-14 mt-10 max-w-full text-3xl leading-none text-white bg-indigo-900 w-[331px] max-md:px-5 max-md:mt-10">
          Insert Video Here
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;