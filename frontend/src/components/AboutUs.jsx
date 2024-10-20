import React, { useEffect, useState } from "react";
import "./AboutUs.css"; // Import CSS for styling
import Layout from "./Layout";

const AboutUs = () => {
  const [text, setText] = useState("");
  const fullText = "  Hi, we are Lecturix! We are dedicated to providing a comprehensive platform for students and teachers alike. Our goal is to enhance learning experiences through innovative tools and resources.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 40); // Adjust typing speed here
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <Layout>
    <div className="about-us">
      <h1 color="#0C1325">About Us</h1>
      <div className="typewriter">
        <p>{text}</p>
      </div>
    </div>
    </Layout>
  );
};

export default AboutUs;
