import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createTopStart = (
    props: IStrategyProp
): ComputedRef<Omit<IBoundingBox, 'width' | 'height'>> => {

    return computed(() => {
    
        let x: number = props.activator.x;
        
        if ( Calc.sum( x, props.context.width ) > props.window.width ) {

            x = Calc.sum( props.window.width, - props.context.width );

			x = x >= 0 ? x : 0;

        }

        let y: number = Calc.sum(
			props.activator.y,
			- props.margin,
			- props.context.height
		);

        if ( y < 0 ) {

			y = Calc.sum(
					props.activator.y,
					props.margin,
					props.activator.height
				);

			y = Calc.sum( y, props.context.height ) <= props.window.height ? 
					y : Calc.sum( props.window.height, -props.context.height );

        }

        return { x, y };

     });

};
