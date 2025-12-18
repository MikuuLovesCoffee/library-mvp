import { motion } from "framer-motion";

interface FloatingBookProps {
  delay?: number;
  className?: string;
  rotation?: number;
  scale?: number;
}

function FloatingBook({ delay = 0, className = "", rotation = 0, scale = 1 }: FloatingBookProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, rotateY: rotation, rotateX: 5 }}
      animate={{
        y: [0, -20, 0],
        rotateY: [rotation, rotation + 5, rotation],
        rotateX: [5, 10, 5],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        transform: `scale(${scale})`,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <div
        className="relative w-24 h-32 md:w-32 md:h-44 lg:w-40 lg:h-56 rounded-md shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-15deg)",
        }}
      >
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: "linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(283 70% 50%) 100%)",
            transform: "translateZ(8px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="absolute inset-2 border border-white/20 rounded-sm" />
          <div className="absolute bottom-4 left-3 right-3">
            <div className="h-1.5 bg-white/40 rounded-full mb-1.5" />
            <div className="h-1 bg-white/30 rounded-full w-2/3" />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-l-sm"
          style={{
            background: "linear-gradient(90deg, hsl(217 91% 40%) 0%, hsl(217 91% 50%) 100%)",
            width: "12px",
            transform: "rotateY(90deg) translateZ(-6px)",
            transformOrigin: "left center",
          }}
        />
      </div>
    </motion.div>
  );
}

function Particle({ index }: { index: number }) {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 3 + Math.random() * 4;
  const size = 2 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full bg-primary/30"
      style={{
        left: `${randomX}%`,
        width: size,
        height: size,
      }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{
        y: "-10vh",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export function Hero3D() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1200px" }}>
        <FloatingBook delay={0} className="left-[10%] top-[20%]" rotation={-10} scale={0.8} />
        <FloatingBook delay={0.5} className="left-[25%] top-[35%]" rotation={15} scale={1} />
        <FloatingBook delay={1} className="right-[25%] top-[25%]" rotation={-5} scale={0.9} />
        <FloatingBook delay={1.5} className="right-[10%] top-[40%]" rotation={20} scale={0.7} />
        <FloatingBook delay={0.8} className="left-[15%] bottom-[20%]" rotation={10} scale={0.85} />
        <FloatingBook delay={1.2} className="right-[15%] bottom-[25%]" rotation={-15} scale={0.75} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background)) 70%)",
        }}
      />
    </div>
  );
}
