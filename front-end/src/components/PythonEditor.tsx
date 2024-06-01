"use client";
import React, { useState } from "react";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

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
    if (testResults && testResults.results) {
      try {
        const submitResponse = await axios.post(
          "http://localhost:8000/submit/",
          {
            code: code,
            output: testResults.results,
          }
        );
        console.log("Submission successful", submitResponse.data);
        alert("Submission Successful!");
      } catch (submitError: any) {
        console.error("Error submitting code:", submitError);
        alert(`Submission Failed: ${submitError.message}`);
      }
    } else {
      setError("Test results are incomplete or missing.");
    }
  };

  return (
    <div className="bg-black overflow-y-hidden max-h-screen">
      <h1 className="text-3xl text-white text-center p-2 font-bold">My Py</h1>
      <h1 className="text-xl text-white text-center pb-2">
        Python Execution Environment
      </h1>
      <div className="grid grid-cols-2 h-screen w-screen p-2">
        <div className="border-r-2 border-black">
          <Editor
            height="80vh"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            options={{
              fontSize: 18,
              minimap: {
                enabled: false,
              },
              padding: {
                top: 16,
              },
              contextmenu: false,
            }}
            onChange={handleChange}
          />
          <button
            onClick={handleTestCode}
            className="m-4 bg-yellow-600 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
          >
            Test Code
          </button>
          <button
            onClick={handleSubmitCode}
            className="m-4 bg-blue-600 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
          >
            Submit Code
          </button>
        </div>
        <div className="p-4 h-[80vh] bg-[#1e1e1e] text-white border-l-2 border-black overflow-scroll">
          {error ? (
            <div>
              <p className="text-2xl pb-2 font-bold text-red-500">Error</p>
              <pre className="whitespace-pre-wrap break-all">{error}</pre>
            </div>
          ) : (
            <div>
              <p className="text-2xl pb-2 font-bold text-yellow-300">Output</p>
              <pre className="whitespace-pre-wrap break-all">{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PythonEditor;
