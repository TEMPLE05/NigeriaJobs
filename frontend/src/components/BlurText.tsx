import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 200,
  animateBy = "words",
  direction = "top",
  className = "",
}) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInView(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 0,
            filter: "blur(20px)",
            y: direction === "top" ? 20 : direction === "bottom" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
          }}
          animate={inView ? {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            x: 0,
          } : {
            opacity: 0,
            filter: "blur(20px)",
            y: direction === "top" ? 20 : direction === "bottom" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
          }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            type: "spring",
            damping: 12,
            stiffness: 100,
          }}
          style={{ display: "inline-block", willChange: "transform" }}
        >
          {element}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;