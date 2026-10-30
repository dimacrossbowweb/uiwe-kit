import { type IAnimationProp, type IAnimationBox } from '../types/animation-prop.type';
import { createSlideAnimation } from './slide';
import { createScaleAnimation } from './scale';

type TAnimationAction = ( props: IAnimationProp ) => IAnimationBox;

export const animations: Record< string, TAnimationAction > = {

	'slide': createSlideAnimation,
	'scale': createScaleAnimation,

};

export type TAnimation = keyof typeof animations;

export function getAnimation ( name: string ): TAnimationAction {

	// `animations` is keyed by an open `string`, so an unknown name resolves to
	// undefined. The original fallback read `animations[ 0 ]`, which is not a
	// real entry — slide is the documented default animation.
	const animation: TAnimationAction = animations[ name ] ?? createSlideAnimation;

	return animation;

}

export function animationWaiting ( animation: IAnimationBox ): IAnimationBox {

	return {

		onEnter: ( item: HTMLElement, duration: number ): Promise<any> => {

			const pe: string = item.style.pointerEvents ?? 'auto';

			item.style.pointerEvents = 'none';

			animation
				.onEnter( item, duration )
				.then( () => {

					item.style.pointerEvents = pe;

				} );

			return Promise.resolve( item );

		},

		onLeave: ( item: HTMLElement, duration: number ): Promise<any> => {

			const pe: string = item.style.pointerEvents ?? 'auto';

			item.style.pointerEvents = 'none';

			animation
				.onLeave( item, duration )
				.then( () => {

					item.style.pointerEvents = pe;

				} );

			return Promise.resolve( item );

		}

	};

}
