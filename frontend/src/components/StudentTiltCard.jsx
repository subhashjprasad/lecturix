import React, { useRef } from "react";
import DottedJoinButton from "./DottedJoinButton";
import { useAuth0 } from "@auth0/auth0-react";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

const Example = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-[#0C1325] pr-3 py-12 text-slate-900">
      <StudentTiltCard />
      <div className="flex flex-col justify-center items-center mt-4"> {/* Margin added for spacing */}
        <h1 className="text-4xl font-bold text-white mb-4">{user.name}</h1>
        <DottedJoinButton />
      </div>
    </div>
  );
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

const StudentTiltCard = () => {
  
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return [0, 0];

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="relative h-64 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-[#dedde4]"
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-4 grid place-content-center rounded-xl from-indigo-500 to-[#dedde4] shadow-lg"
      >
        <p
          style={{
            transform: "translateZ(50px)",
          }}
          className="text-center text-2xl font-bold"
        >
          Welcome to the Student Portal!
        </p>
      </div>
    </motion.div>
  );
};

export default Example;
