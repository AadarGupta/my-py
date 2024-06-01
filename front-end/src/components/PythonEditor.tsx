"use client";
import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

const PythonEditor = () => {
  // Variables for code, results, errors, most recent submission and how long ago a submission was made
  const [code, setCode] = useState<string>("print('Hello, World!')");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [lastSubmissionDate, setLastSubmissionDate] = useState<Date | null>(
    null
  );

  // Updates every second to track time since last submission
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastSubmissionDate) {
        setTimeAgo(timeSince(lastSubmissionDate));
      }
    }, 1000);

    if (lastSubmissionDate) {
      setTimeAgo(timeSince(lastSubmissionDate));
    }

    return () => clearInterval(timer);
  }, [lastSubmissionDate]);

  // Calculates whether the time since last submission should be days/hours/mins/seconds
  function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 86400;
    if (interval >= 1) {
      return (
        Math.floor(interval) +
        " d" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    interval = seconds / 3600;
    if (interval >= 1) {
      return (
        Math.floor(interval) +
        "h" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    interval = seconds / 60;
    if (interval >= 1) {
      return (
        Math.floor(interval) +
        "m" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    return Math.floor(seconds) + "s ago";
  }

  // Handles all changes to the code
  const handleChange = (value?: string) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  // Shows number of submissions based on the username
  const handleViewSubmissions = async () => {
    const username = prompt(
      "Please enter your username to view your submissions:"
    );
    if (!username) {
      alert("Username is required to view submissions.");
      return;
    }

    // Queries the backend endpoint to find how many submissions have been made by username
    try {
      const response = await axios.get(
        `http://localhost:8000/submissions/${username}`
      );
      alert(`You have made ${response.data} submission(s)`);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      alert(`Error fetching submissions: ${error}`);
    }
  };

  // Tests the code
  const handleTestCode = async () => {
    try {
      const response = await axios.post("http://localhost:8000/test/", {
        code,
      });
      setOutput(response.data.results);
      setError(response.data.error);
      return response.data;
    } catch (error) {
      console.error("Error executing code:", error);
      setError(`Error: ${error}`);
      return null;
    }
  };

  // Submits the code with a corresponding username
  const handleSubmitCode = async () => {
    const username = prompt("Please enter your username for the submission:");

    if (!username) {
      alert("Username is required to submit the code.");
      return;
    }

    // Checks if code is valid
    const testResults = await handleTestCode();
    if (testResults && testResults.results) {
      try {
        // Calls the backend endpoint to submit the code with results and the username
        const submitResponse = await axios.post(
          "http://localhost:8000/submit/",
          {
            code: code,
            output: testResults.results,
            username: username,
          }
        );

        // Alerts the user that the submission was successful and updates last submission
        console.log("Submission successful", submitResponse.data);
        alert("Submission Successful!");
        setLastSubmissionDate(new Date());
      } catch (submitError: any) {
        // Alerts the user that the submission has failed
        console.error("Error submitting code:", submitError);
        alert(`Submission Failed: ${submitError.message}`);
      }
    } else {
      // Alerts the user that the results are not sufficient
      alert("Test results are incomplete or missing.");
    }
  };

  return (
    <div className="bg-black overflow-y-hidden h-screen">
      <h1 className="text-3xl text-white text-center p-2 font-bold">MyPy</h1>
      <h1 className="text-xl text-white text-center pb-2">
        Python Execution Environment
      </h1>
      <div className="pt-4 flex">
        <div className="flex justify-start items-center w-[50vw] gap-10 px-4">
          <button
            onClick={handleTestCode}
            className="bg-yellow-600 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
          >
            Test Code
          </button>
          <button
            onClick={handleSubmitCode}
            className="bg-red-600 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
          >
            Submit Code
          </button>
        </div>
        <div className="flex justify-end items-center w-[50vw] px-4">
          <button
            onClick={handleViewSubmissions}
            className="bg-blue-600 hover:opacity-85 text-white font-bold py-2 px-4 rounded"
          >
            View Submissions
          </button>
        </div>
      </div>
      <p className="text-sm text-white px-4 py-2 justify-end flex text-right">
        {lastSubmissionDate
          ? `Last Submission: ${timeAgo}`
          : "No submissions yet"}
      </p>
      <div className="grid grid-cols-2 w-screen">
        <div className="border-r-2 border-black">
          <Editor
            height="75vh"
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
        </div>
        <div className="p-4 pb-0 h-[75vh] bg-[#1e1e1e] text-white border-l-2 border-black overflow-scroll">
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
