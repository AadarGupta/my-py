"use client";
import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const PythonEditor = () => {
  const [code, setCode] = useState<string>("print('Hello, World!')");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (value?: string) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleTestCode = async () => {
    try {
      const response = await axios.post("http://localhost:8000/test/", {
        code,
      });
      setOutput(response.data.results);
      setError(response.data.error);
      return response.data; // Return data for further processing
    } catch (error) {
      console.error("Error executing code:", error);
      setError(`Error: ${error}`);
      return null; // In case of error, return null to prevent further actions
    }
  };

  const handleSubmitCode = async () => {
    const testResults = await handleTestCode();
    if (testResults) {
      try {
        const submitResponse = await axios.put(
          "http://localhost:8000/submit/",
          {
            id: uuidv4(),
            code: code,
            output: testResults.results,
            error: testResults.error,
          }
        );
        console.log("Submission successful", submitResponse.data);
      } catch (submitError) {
        console.error("Error submitting code:", submitError);
        setError(`Submission error: ${submitError}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen w-screen bg-white">
      <div className="p-4">
        <Editor
          height="90vh"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          options={{
            fontSize: 18,
            minimap: {
              enabled: false,
            },
            contextmenu: false,
          }}
          onChange={handleChange}
        />
        <button
          onClick={handleTestCode}
          className="mt-4 bg-[#fed439] hover:opacity-85 text-white font-bold py-2 px-4 rounded"
        >
          Test Code
        </button>
        <button
          onClick={handleSubmitCode}
          className="mt-4 bg-blue-500 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
        >
          Submit Code
        </button>
      </div>
      <div className="p-4 bg-black text-white">
        {error ? (
          <div>
            <p className="text-2xl">Error:</p>
            <pre className="whitespace-pre-wrap break-all">{error}</pre>
          </div>
        ) : (
          <div>
            <p className="text-2xl">Output:</p>
            <pre className="whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonEditor;
