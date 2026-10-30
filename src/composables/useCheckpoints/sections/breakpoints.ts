import { type TCheckpointSection } from '../checkpoints.type';

export const breakpoints: Record<string, TCheckpointSection> = {

    'xs': [ 0, 576 ],
    'sm': [ 576, 768 ],
    'md': [ 768, 992 ],
    'lg': [ 992, 1200 ],
    'xl': [ 1200, 1400 ],
    'xxl': [ 1400, Infinity ],

};
