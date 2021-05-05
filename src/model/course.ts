import type { BasePropOptions } from '@typegoose/typegoose/lib/types';
import type { Types } from 'mongoose';
import type { Ref } from 'react';
import type { Description, Fields } from './util';
import {
  rprop, prop, fields, ruprop, uprop,
} from './util';

export enum Semester {
  Spring,
  SummerI,
  SummerII,
  Fall,
  Winter
}

const toSem = (v: string): Semester => {
  let ret: Semester | undefined;
  const a = v.replace(/\s/g, '');
  const b = a[0];
  if (b !== undefined) {
    const c = b.toUpperCase() + a.slice(1).toLowerCase();
    if (c === 'Summer') {
      return Semester.SummerI;
    }
    ret = Semester[c];
  }
  if (ret === undefined) {
    throw new Error(`Unable to parse "${v}" as Semester`);
  }
  return ret;
};

export function keysOf<T>(e: T): (keyof T)[] {
  return Object.keys(e).filter((x) => Number.isNaN(+x)) as any;
}

const semProp = (v?: Omit<BasePropOptions, 'required'>): PropertyDecorator => rprop({
  ...v,
  set(ss: string[] | string): Semester[] | Semester {
    return Array.isArray(ss) ? ss.map(toSem) : toSem(ss);
  },
  get(s) {
    return s;
  },
  enum: Semester,
});

export class ScrapedCourseSet {
  declare public _id: Types.ObjectId;

  @rprop()
  public year!: number

  @semProp()
  public semester!: Semester
}

export class Course {
  @rprop()
  public department!: string

  @rprop()
  public number!: number
}

export class Offering {
  @rprop({ type: () => [String] })
  public semester!: string[]

  @prop({ enum: [0, 1] })
  public yearParity?: number
}

// TODO index
export class ScrapedCourse extends Course {
  @rprop()
  public fullName!: string

  @rprop()
  public minCredits!: number

  @rprop()
  public maxCredits!: number

  @rprop({ type: () => [Course] })
  public prerequisites!: Course[]

  @rprop()
  public offering!: Offering

  @rprop()
  public repeat?: number

  @rprop({ type: () => [Course] })
  public offeredAs!: Course[]

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

  @semProp()
  public semester!: Semester

  @rprop()
  public year!: number

  @rprop()
  public timeslot!: string
}

const id = <T>(x: T): T => x;
const Grade_ = {
  A: 4.00,
  'A-': 3.67,
  'B+': 3.33,
  B: 3.00,
  'B-': 2.67,
  'C+': 2.33,
  C: 2.00,
  'C-': 1.67,
  F: 0.00,
} as const;

const Grade: typeof Grade_ = Object.assign(Object.create(null), Grade_);

// TODO fix up schema, index on all except grade
@fields
export class CoursePlan {
  declare static fields: Description<Fields<CoursePlan>>

  declare public _id: Types.ObjectId;

  @ruprop()
  sbuId!: number

  // TODO ref to Course?
  @ruprop()
  department!: string

  @ruprop()
  courseNum!: string

  @ruprop()
  section!: string

  @ruprop()
  semester!: string

  @ruprop()
  year!: string

  @uprop({
    type: Number,
    enum: Grade,
    get: id,
    set(v: string) {
      return Grade?.[v];
    },
  })
  grade?: typeof Grade[keyof typeof Grade]
}
