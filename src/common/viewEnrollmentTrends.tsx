import React from 'react';
import {
  Col, Container, Form, Row, Button,
} from 'react-bootstrap';
import { VictoryChart, VictoryLine, VictoryScatter } from 'victory';
import { keysOf, Semester } from '../model/course';
import { Bar } from './util';

export default function ViewEnrollmentTrends({ data }: { data: any }): JSX.Element {
  return (
    <>
      <Bar />
      <Container>
        <Form action="/viewEnrollmentTrends" method="get">
          <Form.Group as={Row}>
            <Form.Label column>
              Start Year
            </Form.Label>
            <Col>
              <Form.Control type="text" placeholder="2001" name="syear" required />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column>
              Start Semester
            </Form.Label>
            <Form.Control as="select" name="ssemester">
              {
                keysOf(Semester).map((v) => <option key={v}>{v}</option>)
              }
            </Form.Control>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column>
              End Year
            </Form.Label>
            <Col>
              <Form.Control type="text" placeholder="2001" name="eyear" required />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column>
              End Semester
            </Form.Label>
            <Form.Control as="select" name="esemester">
              {
                keysOf(Semester).map((v) => <option key={v}>{v}</option>)
              }
            </Form.Control>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column>
              Selected Classes
            </Form.Label>
            <Form.Control type="text" placeholder="CSE 123, AMS 456" name="classes" required />
          </Form.Group>
          <Button type="submit">
            Submit
          </Button>
        </Form>
        <VictoryChart>
          {
            data.map((x, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i}>
                <VictoryLine
                  interpolation="linear"
                  data={x}
                  style={{ data: { stroke: '#c43a31' } }}
                />
                <VictoryScatter
                  data={x}
                  size={5}
                  style={{ data: { fill: '#c43a31' } }}
                />
              </div>
            ))
          }
        </VictoryChart>
      </Container>
    </>
  );
}
