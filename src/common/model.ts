import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import { BasePropOptions, Ref } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import prop_ from './RT-PROP';

// TODO split classes

const s = Symbol('fields');
type IsString<T> = T extends string ? T : never
type IsNotFunction<T, R> = T extends (...args: any[]) => unknown ? never : IsString<R>
type ConstructorOf<T> = T extends string ? StringConstructor :
  T extends boolean ? BooleanConstructor :
  T extends number ? NumberConstructor :
  unknown;
export type Fields<T> = {
  [P in keyof T as IsNotFunction<T[P], P>]-?: NonNullable<T[P]>
}
export type Description<T> = {
  [P in keyof T]: { ty: ConstructorOf<T[P]>, short: string, long: string, map?: [string, string] }
}

type Ctor<T> = { new(...args: any[]): T }
function fields<T extends Ctor<U> & { fields: Fields<U> }, U>(ctor: T) {
  ctor.fields = ctor.prototype[s]; // eslint-disable-line no-param-reassign
}

type OptionsI = BasePropOptions & { short: string, long: string, map?: [string, string] };

function prop(options?: OptionsI, kind?: WhatIsIt): PropertyDecorator {
  const f = prop_(options, kind);
  const {
    type, short, long, map,
  } = options ?? {};
  return (target: any, propertyKey) => {
    const ty = type ?? Reflect.getMetadata('design:type', target, propertyKey);
    const v = {
      ty, short, long, map,
    };
    if (ty === Boolean) {
      if (!Array.isArray(options?.map)) {
        throw new Error('"map" propery must exist');
      }
      if (options?.map.length !== 2) {
        throw new Error('"map" property must have length 2');
      }
    }
    (target[s] ??= {})[propertyKey] = v; // eslint-disable-line no-param-reassign
    f(target, propertyKey);
  };
}

function rprop(options?: Omit<OptionsI, 'required'>, kind?: WhatIsIt): PropertyDecorator {
  return prop({
    short: '', long: '', ...options, required: true,
  }, kind);
}

export class xCreditsGradeY {
  @rprop()
  public credits!: number

  @rprop()
  public grade!: string
}

export class DegreeRequirements {
  @rprop()
  public degreeName!: string

  @rprop()
  public requirementVersion!: string

  @rprop()
  public track!: string

  @rprop()
  public minimumCumulativeGPA!: string

  @rprop()
  public timelimit!: string

  @rprop({ map: ['Required', 'Not-Required'] })
  public finalRecomendation!: boolean

  @rprop()
  public creditsNeededToGraduate!: number

  @rprop({ ref: () => xCreditsGradeY })
  public prerequisites!: xCreditsGradeY

  @rprop({ type: () => [Course] })
  public coreCourses!: Course[]

  @rprop({ type: () => [Tracks] })
  public tracks!: Tracks[]
}

export class CoursePlanComment {
  @rprop({ ref: () => Student })
  public author!: Ref<Student>

  @rprop()
  public text!: string
}

export class Elective {
  @rprop()
  public numCourses!: number

  @rprop()
  public totalCredits!: number

  @rprop()
  public range!: string

  @rprop({ type: () => [[String]] })
  public substitutions!: [string][]
}

export class Tracks {
  @rprop()
  public totalCredits!: number

  @rprop({ type: () => [Course] })
  public coreCourses!: Course[]

  @rprop({ type: () => Elective })
  public electives!: Elective
}

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

export class CoursePlan {
  @rprop({ type: () => [[String]] })
  public comments!: [string][]

  @rprop({ type: () => [CourseOffering] })
  public courses!: CourseOffering[]
}

@fields
export class User {
  declare static fields: Description<Fields<User>>

  declare public __t: 'GPD' | 'Student';

  declare public _id: Types.ObjectId;

  @rprop({ unique: true })
  public username!: string;

  @rprop()
  public firstName!: string;

  @rprop()
  public lastName!: string;

  @prop()
  public email?: string;

  @rprop()
  public password!: string;
}

export class GPD extends User {
  declare public __t: 'GPD';
}

@fields
export class Student extends User {
  declare static fields: Description<Fields<Student>>

  declare public __t: 'Student';

  @rprop()
  public department!: string

  @rprop()
  public track!: string

  @rprop()
  public requirementVersion!: string

  @rprop()
  public gradSemester!: string

  @rprop()
  public coursePlan!: string

  @rprop({ map: ['False', 'True'] })
  public graduated!: boolean

  @rprop()
  public comments!: string

  @rprop()
  public sbuId!: number

  // @rprop()
  public degreeRequirements?: DegreeRequirements
}
