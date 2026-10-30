import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createRightUp = (
    props: IStrategyProp
): ComputedRef<Omit<IBoundingBox, 'width' | 'height'>> => {

    return computed(() => {
    
        let x: number = Calc.sum(
			props.activator.x,
			props.activator.width,
			props.margin
		);
        
        if ( Calc.sum( x, props.context.width ) > props.window.width ) {

            x = Calc.sum( 

				props.activator.x,
				-props.margin,
				-props.activator.width

			);

			x = x >= 0 ? x : 0;

        }

        let y: number = props.activator.y;

        if ( Calc.sum( y, props.context.height ) > props.window.height ) {

			y = Calc.sum(
					props.window.height,
					-props.context.height
				);


        }

        return { x, y };

     });

};
