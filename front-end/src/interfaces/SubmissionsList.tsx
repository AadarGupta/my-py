import Submission from "@/interfaces/Submission";

export default interface SubmissionsListProps {
  showModal: boolean;
  submissions: Submission[];
  handleClose: () => void;
  handleOpenSubmission: (id: string) => void;
}
