export default interface TerminalProps {
  user: string;
  output: string;
  error: string;
  onTestCode: () => void;
  onSubmitCode: (username?: string) => void;
}
