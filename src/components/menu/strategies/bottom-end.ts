import { computed, type ComputedRef } from 'vue';
import { Calc } from '@/global/utils/calc';
import { type IBoundingBox, type IStrategyProp } from '../types/strategy-prop.type';

export const createBottomEnd = (
    props: IStrategyProp
): ComputedRef<Omit<IBoundingBox, 'width' | 'height'>> => {

    return computed(() => {
    
        let x: number = Calc.sum(
			props.activator.x,
			props.activator.width,
			-props.context.width
		);
        
        if ( x < 0 ) {

            x = 0;

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
