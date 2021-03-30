import { DocumentType } from '@typegoose/typegoose';
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import { BasePropOptions, Ref } from '@typegoose/typegoose/lib/types';
import prop_ from './RT-PROP';

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
  public requirements!: string[]
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

@fields
export class User {
  declare static fields: Description<Fields<User>>
  declare public __t: string;

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
  public async importCourseOfferings(this: DocumentType<GPD>, file: any) {
    // TODO
  }
}

@fields
export class Student extends User {
  declare static fields: Description<Fields<Student>>

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
