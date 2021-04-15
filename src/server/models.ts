import {
  getDiscriminatorModelForClass, getModelForClass,
} from '@typegoose/typegoose';
import {
  User, GPD, Student, Description, Fields, ScrapedCourse, ScrapedCourseSet,
} from '../common/model';

export const UserModel = getModelForClass(User);
export const GPDModel = getDiscriminatorModelForClass(UserModel, GPD);
export const StudentModel = getDiscriminatorModelForClass(UserModel, Student);

export const ScrapedCourseSetModel = getModelForClass(ScrapedCourseSet);
export const ScrapedCourseModel = getModelForClass(ScrapedCourse);
const cmp: { [k: string]: string | undefined } = {
  '=': '$eq', '>': '$gt', '<': '$lt', '!=': '$neq',
};

function entries<T extends { [key: string]: any }, K extends keyof T>(o: T): [keyof T, T[K]][] {
  return Object.entries(o) as any;
}

/** get the fields from the discription from the query string */
export function getQS<T>(originalURL: string, d: Description<Fields<T>>): { [P in keyof T]?: any } {
  const params = new URL(originalURL, 'http://localhost').searchParams;
  const it = entries(d).map(
    ([k, ve]) => {
      const { ty } = ve;
      const v = params.get(k);
      if (v == null || v === '') {
        return null;
      }
      if (ty === String) {
        return [k, { $regex: v }];
      } if (ty === Number) {
        const c = cmp[`${params.get(`${k}_cmp`)}`];
        if (!c) {
          return null;
        }
        return [k, { [c]: v }];
      } if (ty === Boolean) {
        const i = ve.map!.findIndex((x) => x === v);
        if (i === -1) {
          return null;
        }
        return [k, i];
      }
      throw new Error();
    },
  ).filter(<U>(x: U): x is NonNullable<U> => x != null);
  return Object.fromEntries(it);
}

export function copyStudentWithPermissions(
  body: { [k in keyof Student]: string }, user: User,
): Partial<Student> {
  if (user.__t !== 'GPD') {
    // TODO field by field check
    throw Error('Permission denied');
  }

  const it = entries(Student.fields).map(
    ([k, ve]) => {
      if (body[k] != null) {
        return [k, body[k]];
      }
      console.warn(`missing field ${k}`);
      return null;
    },
  ).filter(<U>(x: U): x is NonNullable<U> => x != null);
  return Object.fromEntries(it);
}
