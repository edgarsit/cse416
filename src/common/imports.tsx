import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Bar } from './util';

export default function Imports():JSX.Element {
  return (
    <>
      <Bar />
      <Container>
        <Button block>5.1 Scrape Course Information</Button>
        <Button block>5.2 Import Degree Requirements</Button>
        <Button block>5.3 Import Course Offerings</Button>
      </Container>
    </>
  );
}
