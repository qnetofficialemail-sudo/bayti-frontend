import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ProposalPage() {
  const { seller } = useParams();

  useEffect(() => {
    window.location.replace(
      `https://qnetofficialemail-sudo.github.io/bayti-proposals/${seller}.html`
    );
  }, [seller]);

  return null;
}
