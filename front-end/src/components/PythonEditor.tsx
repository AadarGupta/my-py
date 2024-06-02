"use client";
import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import axios from "axios";
import CustomButton from "./CustomButton";
import Submission from "@/interfaces/Submission";
import SubmissionsList from "./SubmissionsList";
import Terminal from "./Terminal";
import RoundIconButton from "./RoundIconButton";

const PythonEditor = () => {
  // Variables for code, results, errors, most recent submission and how long ago a submission was made
  const [code, setCode] = useState<string>("print('Hello, World!')");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [lastSubmissionDate, setLastSubmissionDate] = useState<Date | null>(
    null
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState("user");
  const [showHelp, setShowHelp] = useState(false);

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
        " day" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    interval = seconds / 3600;
    if (interval >= 1) {
      return (
        Math.floor(interval) +
        " hr" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    interval = seconds / 60;
    if (interval >= 1) {
      return (
        Math.floor(interval) +
        " min" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );
    }
    return Math.floor(seconds) + " sec ago";
  }

  const showHelpMenu = () => {
    alert(`HELP MENU:

Test Code to run your code.
Submit Code to save your code.
Open Submission to open/view past submissions.

OR

Terminal: Type 'help' to view available commands`);
  };

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
    if (!username) return;

    try {
      const response = await axios.get(
        `http://localhost:8000/submissions/${username}`
      );
      setSubmissions(response.data);
      setShowModal(true);
    } catch (error) {
      alert(`Error fetching submissions: ${error}`);
    }
  };

  // Sets code to the open submission based on id
  const handleOpenSubmission = async (code_id: string | null) => {
    setShowModal(false);
    let id = code_id;
    if (!code_id) {
      id = prompt("Please enter a submission id:");
      if (!id) {
        alert("id is required to open the submission.");
        return;
      }
    }

    // Queries the backend endpoint to get the submission from id
    try {
      const response = await axios.get(`http://localhost:8000/open/${id}`);
      setCode(response.data.code);
      setOutput("");
      setUser(response.data.username);
    } catch (error: any) {
      console.error("Error opening submission:", error);
      alert(`Could not open submission with id #${id}`);
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
    } catch (err: any) {
      console.error("Error executing code:", err);
      setError(`Error: ${err}`);
      return null;
    }
  };

  // Submits the code with a corresponding username
  const handleSubmitCode = async (name?: string | null) => {
    let username: string | null = "";
    if (!name || name == "user") {
      username = prompt("Please enter your username for the submission:");
      if (!username) {
        alert("Username is required to submit the code.");
        return;
      }
    } else {
      username = name;
    }

    setUser(username);

    // Proceed with testing and submitting the code
    const testResults = await handleTestCode();
    if (testResults && !testResults.error) {
      try {
        console.log(testResults);
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
    <div>
      <div className="bg-black overflow-y-hidden h-screen">
        <h1 className="text-3xl text-white text-center p-2 font-bold">RunPy</h1>
        <h1 className="text-xl text-white text-center pb-2">
          Python Execution Environment
        </h1>
        <div className="pt-4 flex">
          <div className="flex justify-start items-center w-[50vw] gap-10 px-4">
            <CustomButton color="yellow" onClick={handleTestCode}>
              Test Code
            </CustomButton>
            <CustomButton color="red" onClick={() => handleSubmitCode(null)}>
              Submit Code
            </CustomButton>
          </div>
          <div className="flex justify-end items-center w-[50vw] px-4 gap-4">
            <CustomButton color="blue" onClick={handleViewSubmissions}>
              Open Submission
            </CustomButton>
            <RoundIconButton
              onClick={showHelpMenu}
              icon={<span className="text-black text-2xl">?</span>}
            />
          </div>
        </div>
        <div className="px-4 py-2 justify-end items-end flex">
          <p className="text-sm text-white text-right">
            {lastSubmissionDate
              ? `Last Submission: ${timeAgo}`
              : "No submissions yet"}
          </p>
        </div>
        <div className="flex justify-center">
          <SubmissionsList
            showModal={showModal}
            submissions={submissions}
            handleClose={() => setShowModal(false)}
            handleOpenSubmission={handleOpenSubmission}
          />
        </div>
        <div className={!showModal ? "grid grid-cols-2 w-screen" : "hidden"}>
          <div className="border-r-4 border-black">
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
          <Terminal
            user={user}
            output={output}
            error={error}
            onTestCode={handleTestCode}
            onSubmitCode={handleSubmitCode}
          />
        </div>
      </div>
    </div>
  );
};

export default PythonEditor;
