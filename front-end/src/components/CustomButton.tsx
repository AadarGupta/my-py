import ButtonProps from "@/interfaces/Button";
import React from "react";

const CustomButton = ({ color, onClick, children }: ButtonProps) => {
  const colorMap: { [key: string]: string } = {
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    red: "bg-red-600 hover:bg-red-700",
    close: "bg-red-500, hover:bg-red-600",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  const colorClass = colorMap[color] || colorMap["blue"];

  return (
    <button
      onClick={onClick}
      className={`${colorClass} text-white font-bold py-2 px-4 rounded hover:opacity-85`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
