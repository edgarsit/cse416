import {
  getDiscriminatorModelForClass, getModelForClass, prop, DocumentType,
} from '@typegoose/typegoose';
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import { BasePropOptions, Ref } from '@typegoose/typegoose/lib/types';

function rprop(options?: BasePropOptions, kind?: WhatIsIt): PropertyDecorator {
  if (options !== undefined) {
    options.required = true; // eslint-disable-line no-param-reassign
  }
  return prop(options, kind);
}

export class DegreeRequirements {
    @rprop()
    public department!: string

    @rprop()
    public track!: string

    @rprop()
    public requirementVersion!: string

    @rprop()
    public creditsNeededToGraduate!: number

    @rprop({ type: () => [String] })
    public requirements!: [string]
}

export class CoursePlanComment {
    @rprop({ ref: () => Student })
    public author!: Ref<Student>

    @rprop()
    public text!: string
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

    @rprop({ type: () => [Course] })
    public courses!: Course[]
}

export class User {
  @rprop({ unique: true })
  public userName!: string;

  @rprop()
  public password!: string;
}

export const UserModel = getModelForClass(User);

export class GPD extends User {
  public async importCourseOfferings(this: DocumentType<GPD>, file: any) {
    // TODO
  }
}

export const GPDModel = getDiscriminatorModelForClass(UserModel, GPD);

export class Student extends User {
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

  @rprop()
  public graduated!: boolean

  @rprop()
  public comments!: string

  @rprop()
  public sbuId!: number

  // @rprop()
  public degreeRequirements?: DegreeRequirements

  public async editStudentInformation(this: DocumentType<Student>) {
    // TODO
  }

  public async viewCoursePlanHistory(this: DocumentType<Student>) {
    // TODO
  }

  public async suggestCoursePlan(this: DocumentType<Student>) {
    // TODO
  }

  public async shareCoursePlan(this: DocumentType<Student>, c: CoursePlan) {
    // TODO
  }
}

export const StudentModel = getDiscriminatorModelForClass(UserModel, Student);
