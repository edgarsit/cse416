import { prop } from '@typegoose/typegoose';
import { WhatIsIt } from '@typegoose/typegoose/lib/internal/constants';
import { BasePropOptions } from '@typegoose/typegoose/lib/types';

export function rprop(options?: BasePropOptions, kind?: WhatIsIt): PropertyDecorator {
    if (options !== undefined) { options.required = true; }
    return prop(options, kind);
}