import React from 'react';
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import { Bar } from './util';

export default function Import(): JSX.Element {
  return (
    <>
      <Bar />
      <Container>
        <Form action="/import/scrape" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="file">
            <Form.Label column>PDF File</Form.Label>
            <Col>
              <Form.File
                multiple
                name="file"
                accept="application/pdf"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="semester">
            <Form.Label column>Semester</Form.Label>
            <Col>
              <Form.Control type="text" placeholder="Spring" name="semester" />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="year">
            <Form.Label column>Year</Form.Label>
            <Col>
              <Form.Control type="text" placeholder="2021" name="year" />
            </Col>
          </Form.Group>
          <Button type="submit">5.1 Scrape Course Information</Button>
        </Form>
        <Button block>5.2 Import Degree Requirements</Button>
        <Button block>5.3 Import Course Offerings</Button>
      </Container>
    </>
  );
}
