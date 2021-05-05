import type { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import type { BasePropOptions } from '@typegoose/typegoose/lib/types';
import { toView } from '../common/utils';
import { prop_ } from './RT-PROP';

const s = Symbol('fields');
type IsString<T> = T extends string ? T : never
type IsNotFunction<T, R> = T extends (...args: any[]) => unknown ? never : IsString<R>
type ConstructorOf<T> = T extends string ? StringConstructor :
  T extends boolean ? BooleanConstructor :
  T extends number ? NumberConstructor :
  T extends Array<unknown> ? ArrayConstructor :
  never;
export type Fields<T> = {
  [P in keyof T as IsNotFunction<T[P], P>]-?: NonNullable<T[P]>
}
export type Description<T> = {
  [P in keyof T]: {
    ty: ConstructorOf<T[P]>,
    short: string,
    long: string,
    mapper?: [string, string]
  }
}

type Ctor<T> = { new(...args: any[]): T }
export function fields<T extends Ctor<U> & { fields: Fields<U> }, U>(ctor: T): void {
  ctor.fields = ctor.prototype[s]; // eslint-disable-line no-param-reassign
}

// TODO @prop({aaa: 0})
type OptionsI<T> = T & ({ short?: string, long?: string }) & { map?: [string, string] };

const hasOwnPropery:
  (target: any, v: symbol) => boolean = Function.call.bind({}.hasOwnProperty) as any;

export function uprop(options?: OptionsI<BasePropOptions>, kind?: WhatIsIt): PropertyDecorator {
  const f = prop_(options, kind);
  const {
    type, short, long, map,
  } = options ?? {};
  // imagine mut on bindings :(
  let enum_ = (options ?? {}).enum;
  return (target: any, propertyKey) => {
    if (typeof propertyKey !== 'string') {
      throw new Error('Cannot annotate symbols');
    }
    if (enum_ != null) {
      if (Array.isArray(enum_)) {
        throw new Error('Enum should be proper enum');
      }
      if (type !== Number) {
        throw new Error('String enums are unimplemented');
      }
      enum_ = Object.entries(enum_)
        .filter(([_, v]) => typeof v === 'number')
        .map(([k, _]) => k);
    }
    const ty = enum_ ?? type ?? Reflect.getMetadata('design:type', target, propertyKey);
    const name = toView(propertyKey);
    if (ty !== Boolean && map != null) {
      throw new Error('Do not use "map" on non-boolean keys');
    }
    const v = {
      ty,
      short: short ?? name,
      long: long ?? name,
      map: map ?? ['True', 'False'],
    };
    const ts: { [x: string]: typeof v } = hasOwnPropery(target, s)
      ? target[s]
      // eslint-disable-next-line no-param-reassign
      : target[s] = Object.create(target[s] ?? null);
    ts[propertyKey] = v;
    f(target, propertyKey);
  };
}

export function prop(options?: BasePropOptions, kind?: WhatIsIt): PropertyDecorator {
  return prop_(options, kind);
}

function r(f) {
  return (options, kind) => f({
    ...options, required: true,
  } as any, kind);
}

export const rprop: (options?: Omit<BasePropOptions, 'required'>, kind?: WhatIsIt) => PropertyDecorator = r(prop);
// TODO why can't we transpose the types?
export const ruprop: (options?: OptionsI<Omit<BasePropOptions, 'required'>>, kind?: WhatIsIt) => PropertyDecorator = r(uprop);
