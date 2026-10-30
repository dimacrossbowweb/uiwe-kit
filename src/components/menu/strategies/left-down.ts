import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createLeftDown = (
    props: IStrategyProp
): ComputedRef<Omit<IBoundingBox, 'width' | 'height'>> => {

    return computed(() => {
    
        let x: number = Calc.sum(
			props.activator.x,
			-props.margin,
			-props.context.width
		);
        
        if ( x < 0 ) {

			x = Calc.sum(
				props.activator.x,
				props.activator.width,
				props.margin
			);

			x = Calc.sum( x, props.context.width ) > props.window.width ?
				Calc.sum( props.window.width, -props.context.width ) : x;

        }

        let y: number = Calc.sum(
			props.activator.y,
			props.activator.height,
			-props.context.height
		);

        if ( y < 0 ) {

			y = 0;


        }

        return { x, y };

     });

};
