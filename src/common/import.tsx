import React from 'react';
import {
  Container, Button, Form, Row, Col,
} from 'react-bootstrap';
import { keysOf, Semester } from '../model/course';
import { Bar } from './util';

function Field({
  s, pl, l, required,
}: { s: string, pl: string, l?: string, required?: boolean }): JSX.Element {
  return (
    <Form.Group as={Row} controlId={s}>
      <Form.Label column>{l ?? s[0]?.toUpperCase() + s.slice(1)}</Form.Label>
      <Col>
        <Form.Control type="text" placeholder={pl} name={s} required={required} />
      </Col>
    </Form.Group>
  );
}

export default function Import(): JSX.Element {
  // TODO dedup
  return (
    <>
      <Bar />
      <Container>
        <Form action="/import/scrape" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="file">
            <Form.Label column>PDF File</Form.Label>
            <Col>
              <Form.File
                name="file"
                accept="application/pdf"
                // required
              />
            </Col>
          </Form.Group>
          <Form.Control as="select" name="semester">
            {
             keysOf(Semester).map((v) => <option key={v}>{v}</option>)
            }
          </Form.Control>
          <Field s="year" pl="2021" />
          <Field s="department" pl="AMS, CSE" l="Departments (comma separated)" />
          <Button type="submit">5.1 Scrape Course Information</Button>
        </Form>
        <Form action="/import/degreeRequirements" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="file">
            <Form.Label column>JSON File</Form.Label>
            <Col>
              <Form.File
                name="file"
                accept="application/json"
                required
              />
            </Col>
          </Form.Group>
          <Button type="submit">5.2 Import Degree Requirements</Button>
        </Form>
        <Form action="/import/courseOffering" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="file">
            <Form.Label column>Offerings File (CSV)</Form.Label>
            <Col>
              <Form.File
                name="file"
                accept="application/csv,text/csv"
                required
              />
            </Col>
          </Form.Group>
          <Button type="submit">5.3 Import Course Offerings</Button>
        </Form>
        <Form action="/import/studentData" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="profile">
            <Form.Label column>Student profile file (CSV)</Form.Label>
            <Col>
              <Form.File
                name="profile"
                accept="application/csv,text/csv"
                required
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="plan">
            <Form.Label column>Student course plan file (CSV)</Form.Label>
            <Col>
              <Form.File
                name="plan"
                accept="application/csv,text/csv"
                required
              />
            </Col>
          </Form.Group>
          <Button type="submit">5.5 Import student data</Button>
        </Form>
        <Form action="/import/grades" method="post" encType="multipart/form-data">
          <Form.Group as={Row} controlId="file">
            <Form.Label column>Import grades (CSV)</Form.Label>
            <Col>
              <Form.File
                name="file"
                accept="application/csv,text/csv"
                required
              />
            </Col>
          </Form.Group>
          <Button type="submit">5.6 Import grades</Button>
        </Form>
      </Container>
    </>
  );
}
