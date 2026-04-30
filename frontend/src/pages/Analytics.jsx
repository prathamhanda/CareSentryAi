import React from "react";
import PageWrapper from "../components/PageWrapper";
import Container from "../components/container.jsx";
import PrescriptionStats from "../components/PrescriptionStats.jsx";

export default function Analytics() {
  return (
    <PageWrapper>
      <Container>
        <PrescriptionStats />
      </Container>
    </PageWrapper>
  );
}
