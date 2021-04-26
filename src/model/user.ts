import type { Types } from 'mongoose';
import { hash, pre } from './RT-PROP';

import type { Description, Fields } from './util';
import { fields, ruprop } from './util';

@fields
// TODO updates do not use this handler
@pre<User>('save', async function userPreSave() {
  if (this.isModified('password')) {
    this.password = await hash(this.password);
  }
})
export class User {
  declare static fields: Description<Fields<User>>

  declare public __t: 'GPD' | 'Student';

  declare public _id: Types.ObjectId;

  @ruprop()
  public firstName!: string;

  @ruprop()
  public lastName!: string;

  @ruprop({ unique: true })
  public email!: string;

  @ruprop()
  public password!: string;
}

export class GPD extends User {
  declare public __t: 'GPD';
}

@fields
export class Student extends User {
  declare static fields: Description<Fields<Student>>

  declare public __t: 'Student';

  @ruprop({ short: 'Dept' })
  public department!: string

  @ruprop()
  public track!: string

  @ruprop()
  public entrySemester!: string

  @ruprop()
  public entryYear!: string

  @ruprop()
  public requirementVersionSemester!: string

  @ruprop()
  public requirementVersionYear!: string

  @ruprop({ short: 'Grad Sem' })
  public graduationSemester!: string

  @ruprop({ short: 'Grad Year' })
  public graduationYear!: string

  @ruprop()
  public graduated!: boolean

  @ruprop()
  public comments!: string

  @ruprop({ unique: true })
  public sbuId!: number
}
