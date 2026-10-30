import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createCenter = (
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
