import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { Ref } from 'react';
import { rprop } from './util';

export enum Grading {
  Letter = 'Letter graded (A, A-, B+, etc.)',
  SU = 'S/U grading'
}

export enum Semester {
  Spring,
  Summer,
  Fall,
  Winter
}

export class ScrapedCourseSet {
  declare public _id: Types.ObjectId;

  @rprop()
  public year!: number

  @rprop({ enum: Semester })
  public semester!: Semester
}

export class CourseBase {
  @rprop()
  public department!: string

  @rprop()
  public number!: number
}

// TODO index
export class ScrapedCourse extends CourseBase {
  @rprop()
  public fullName!: string

  @rprop()
  public minCredits!: number

  @rprop()
  public maxCredits!: number

  @rprop({ type: () => [CourseBase] })
  public prerequisites!: CourseBase[]

  @rprop({ ref: () => ScrapedCourseSet })
  public courseSet!: Ref<ScrapedCourseSet>[]
}

enum Day {
  Mo = 1 << 0,
  Tu = 1 << 1,
  We = 1 << 2,
  Th = 1 << 3,
  Fr = 1 << 4,
  Sa = 1 << 5,
  Su = 1 << 6,
}

export class TimeSlot {
  @rprop()
  public day!: Day

  @rprop()
  public startTime!: number

  @rprop()
  public endTime!: number
}

export class CourseOffering {
  @rprop()
  public department!: string

  @rprop()
  public number!: number

  @prop()
  public section?: string

  @rprop()
  public semester!: string

  @rprop()
  public year!: number

  @rprop()
  public timeslot!: string
}

export class Course {
  @rprop()
  public department!: string

  @rprop()
  public courseNum!: string

  @rprop()
  public section!: string

  @rprop()
  public year!: Date

  @rprop()
  public timeslot!: string

  @rprop({ ref: () => Course })
  public prerequisites!: Ref<Course>[]
}

// TODO fix up schema, index on all except grade
export class CoursePlan {
  @rprop()
  sbuId!: string

  @rprop()
  department!: string

  @rprop()
  courseNum!: string

  @rprop()
  section!: string

  @rprop()
  semester!: string

  @rprop()
  year!: string

  @prop()
  grade?: string
}
