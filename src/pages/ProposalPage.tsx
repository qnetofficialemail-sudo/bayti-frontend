import { useParams } from "react-router-dom";

export default function ProposalPage() {
  const { seller } = useParams();
  const src = `https://qnetofficialemail-sudo.github.io/bayti-proposals/${seller}.html`;

  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      title={`Bayti Proposal — ${seller}`}
    />
  );
}
