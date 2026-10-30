import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createBottomCenter = (
    props: IStrategyProp
): ComputedRef<Omit<IBoundingBox, 'width' | 'height'>> => {

    return computed(() => {
    
        let x: number = Calc.sum( 
			props.activator.x,
			Math.round( props.activator.width / 2 )
			-Math.round( props.context.width / 2 )
		);
        
        if ( x + props.context.width > props.window.width ) {

            x = props.window.width - props.context.width;

        }

        let y: number = Calc.sum(
			props.activator.y,
            props.margin,
        	props.activator.height
		);

        if ( Calc.sum( y, props.context.height ) > props.window.height ) {

            y = Calc.sum(
					props.activator.y,
					- props.margin,
					- props.context.height
				);

			y = y >= 0 ? y : 0;

        }

        return { x, y };

     });

};
