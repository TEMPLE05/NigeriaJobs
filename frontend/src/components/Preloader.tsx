import React from "react";
import { motion } from "motion/react";
import BlurText from "./BlurText";
import "./Preloader.css";

const Preloader: React.FC = () => {
  return (
    <div className="preloader">
      <motion.div
        className="preloader-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <BlurText
          text="Your Next Career"
          delay={150}
          animateBy="words"
          direction="top"
          className="preloader-text"
        />
        <div className="preloader-dots" aria-hidden="true">
          <span className="preloader-dot" />
          <span className="preloader-dot" />
          <span className="preloader-dot" />
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;