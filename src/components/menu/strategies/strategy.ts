import { type ComputedRef } from 'vue';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';
import { createBottomStart } from './bottom-start';
import { createBottomCenter } from './bottom-center';
import { createBottomEnd } from './bottom-end';
import { createTopStart } from './top-start';
import { createTopCenter } from './top-center';
import { createTopEnd } from './top-end';
import { createRightUp } from './right-up';
import { createRightCenter } from './right-center';
import { createRightDown } from './right-down';
import { createLeftUp } from './left-up';
import { createLeftCenter } from './left-center';
import { createLeftDown } from './left-down';
import { createCenter } from './center';

export const strategies: Record<
    string, 
    ( props: IStrategyProp ) => 
        ComputedRef<Omit<IBoundingBox, 'width' | 'height'>>
> = {

    'bottom-start': createBottomStart,
    'bottom-center': createBottomCenter,
    'bottom-end': createBottomEnd,
    'top-start': createTopStart,
    'top-center': createTopCenter,
    'top-end': createTopEnd,
    'right-up': createRightUp,
    'right-center': createRightCenter,
    'right-down': createRightDown,
    'left-up': createLeftUp,
    'left-center': createLeftCenter,
    'left-down': createLeftDown,
    'center': createCenter,

};

export type TStrategy = keyof typeof strategies;
