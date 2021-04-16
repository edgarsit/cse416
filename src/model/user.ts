import { Types } from 'mongoose';
import { DegreeRequirements } from './degreeRequirements';
import {
  Description, rprop, Fields, fields,
} from './util';

@fields
export class User {
  declare static fields: Description<Fields<User>>

  declare public __t: 'GPD' | 'Student';

  declare public _id: Types.ObjectId;

  @rprop()
  public firstName!: string;

  @rprop()
  public lastName!: string;

  @rprop({ unique: true })
  public email!: string;

  // TODO setter
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
  public entrySemester!: string

  @rprop()
  public entryYear!: string

  @rprop()
  public requirementVersionSemester!: string

  @rprop()
  public requirementVersionYear!: string

  @rprop()
  public graduationSemester!: string

  @rprop()
  public graduationYear!: string

  @rprop({ map: ['False', 'True'] })
  public graduated!: boolean

  @rprop()
  public comments!: string

  @rprop({ unique: true })
  public sbuId!: number

  // @rprop()
  public degreeRequirements?: DegreeRequirements
}
