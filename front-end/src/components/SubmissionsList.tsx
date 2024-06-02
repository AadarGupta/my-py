import React from "react";
import SubmissionsListProps from "@/interfaces/SubmissionsList";
import CustomButton from "./CustomButton";

const SubmissionsList = ({
  showModal,
  submissions,
  handleClose,
  handleOpenSubmission,
}: SubmissionsListProps) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="bg-[#1e1e1e] top-0 p-2 text-white h-[100%] w-[50vw] text-center overflow-scroll">
      <CustomButton color="close" onClick={handleClose}>
        Close
      </CustomButton>
      <h1 className="py-2 text-xl font-bold">Submissions</h1>
      {submissions.length > 0 ? (
        submissions.map((sub) => (
          <p
            key={sub.id}
            onClick={() => handleOpenSubmission(String(sub.id))}
            className="cursor-pointer py-2"
          >
            {"id #"}
            {sub.id} - {sub.username}
          </p>
        ))
      ) : (
        <p>No submissions to display.</p>
      )}
    </div>
  );
};

export default SubmissionsList;
