import React from "react";
import PageWrapper from "../components/PageWrapper";
import Container from "../components/container.jsx";
import AdvancedSearch from "../components/AdvancedSearch.jsx";

export default function AdvancedSearchPage() {
  return (
    <PageWrapper>
      <Container>
        <AdvancedSearch />
      </Container>
    </PageWrapper>
  );
}
