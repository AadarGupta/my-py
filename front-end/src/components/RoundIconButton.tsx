import RoundIconButtonProps from "@/interfaces/RoundIconButton";
import React from "react";

const RoundIconButton = ({ onClick, icon }: RoundIconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white w-8 h-8 mr-4 rounded-full flex items-center justify-center hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
      aria-label="Help"
    >
      {icon}
    </button>
  );
};

export default RoundIconButton;
