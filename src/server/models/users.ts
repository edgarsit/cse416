import { DocumentType, getModelForClass, getDiscriminatorModelForClass } from '@typegoose/typegoose';
import { rprop } from './common';
import { DegreeRequirements, CoursePlan } from './courses';



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
  public comments!: boolean

  @rprop()
  public sbu_id!: number

  @rprop()
  public degreeRequirements!: DegreeRequirements

  public async shareCoursePlan(this: DocumentType<Student>, c: CoursePlan) {
    // TODO
  }
}

export const StudentModel = getDiscriminatorModelForClass(UserModel, Student);
