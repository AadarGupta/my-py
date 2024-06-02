import React, { useState } from "react";
import TerminalProps from "@/interfaces/Terminal";

const Terminal = ({
  user,
  output,
  error,
  onTestCode,
  onSubmitCode,
}: TerminalProps) => {
  const [command, setCommand] = useState("");
  const [localError, setLocalError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const parts = command.trim().split(/\s+/);
      const cmd = parts[0];
      const arg = parts.slice(1).join(" ");

      if (cmd === "help") {
        setLocalError("");
        alert(`Commands:\n    test\n    submit <username>`);
      } else if (cmd === "test") {
        setLocalError("");
        onTestCode();
      } else if (cmd === "submit") {
        if (arg) {
          setLocalError("");
          onSubmitCode(arg);
        } else {
          setLocalError("Please provide a username. Type help for assistance");
        }
      } else {
        setLocalError(`Unrecognized command: ${cmd}`);
      }
      setCommand("");
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-[#1e1e1e] text-white p-4">
      <div className="flex-grow overflow-auto mb-4">
        {error || localError ? (
          <div>
            <p className="text-red-500">{error || localError}</p>
          </div>
        ) : (
          <div>
            <pre className="text-white">{output}</pre>
          </div>
        )}
      </div>
      <div className="flex">
        <span className="text-green-500">{user}@machine:~$</span>
        <input
          type="text"
          value={command}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="ml-2 bg-transparent border-none outline-none flex-1"
          placeholder="Type command..."
        />
      </div>
    </div>
  );
};

export default Terminal;
