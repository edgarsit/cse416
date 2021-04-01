import React from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { Bar } from './util';

export default function Import(): JSX.Element {
  return (
    <>
      <Bar />
      <Container>
        <Form action="/import/scrape" method="post" encType="multipart/form-data">
          <Form.File
            id="upload"
            multiple
            name="upload"
          />
          <Button type="submit">5.1 aaa</Button>
        </Form>
        <Button block>5.1 Scrape Course Information</Button>
        <Button block>5.2 Import Degree Requirements</Button>
        <Button block>5.3 Import Course Offerings</Button>
      </Container>
    </>
  );
}
