import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import { BasePropOptions } from '@typegoose/typegoose/lib/types';
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
export function fields<T extends Ctor<U> & { fields: Fields<U> }, U>(ctor: T): void {
  ctor.fields = ctor.prototype[s]; // eslint-disable-line no-param-reassign
}

type OptionsI = BasePropOptions & { short?: string, long?: string, map?: [string, string] };

export function prop(options?: OptionsI, kind?: WhatIsIt): PropertyDecorator {
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

export function rprop(options?: Omit<OptionsI, 'required'>, kind?: WhatIsIt): PropertyDecorator {
  return prop({
    short: '', long: '', ...options, required: true,
  }, kind);
}
