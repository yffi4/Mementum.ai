import React from "react";
import NeonBackground from "./NeonBackground";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0c2a] to-[#1b1740] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <NeonBackground />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className="text-4xl font-bold mb-8"
          style={{
            background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Mementum.ai
        </div>

        {/* Spinner */}
        <div className="relative">
          <div
            className="w-16 h-16 border-4 border-transparent rounded-full animate-spin"
            style={{
              borderTopColor: "#a18aff",
              borderRightColor: "#6feaff",
            }}
          />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin"
            style={{
              borderBottomColor: "#a18aff",
              borderLeftColor: "#6feaff",
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          />
        </div>

        {/* Loading Text */}
        <p className="mt-6 text-[#b8f2ff] text-lg font-medium animate-pulse">
          Checking authentication...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
