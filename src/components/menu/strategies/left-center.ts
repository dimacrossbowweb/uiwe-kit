import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createLeftCenter = (
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
			Math.round( props.activator.height / 2 ),
			-Math.round( props.context.height / 2 )
		);

        if ( Calc.sum( y, props.context.height ) > props.window.height ) {

			y = Calc.sum(
					props.window.height,
					-props.context.height
				);


        }

        return { x, y };

     });

};
