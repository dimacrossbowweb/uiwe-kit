import gsap from 'gsap';
import {
	
	type IAnimationProp,
	type IAnimationBox,

} from '../types/animation-prop.type';
import { type TDirection } from '../types/direction.type';

interface IAnimationDirection {

	x: -1 | 0 | 1;
	y: -1 | 0 | 1;

};

// `TDirection` widens to `string`, so an unrecognised direction misses the map.
// bottom-start is the menu's default placement and doubles as the fallback.
const defaultAnimationDirection: IAnimationDirection = { x: 0, y: 1 };

const animationDirections: Record<TDirection, IAnimationDirection> = {

	'bottom-start': defaultAnimationDirection,
	'bottom-center': { x: 0, y: 1 },
	'bottom-end': { x: 0, y: 1 },

	'top-start': { x: 0, y: -1 },
	'top-center': { x: 0, y: -1 },
	'top-end': { x: 0, y: -1 },

	'left-up': { x: 0, y: 1 },
	'left-center': { x: -1, y: 0 },
	'left-down': { x: 0, y: -1 },

	'right-up': { x: 0, y: 1 },
	'right-center': { x: 1, y: 0 },
	'right-down': { x: 0, y: -1 },

	'center': { x: 0, y: 0 },

};

export const createSlideAnimation = (
	props: IAnimationProp
): IAnimationBox => {

	const animDir: IAnimationDirection = animationDirections[ props.direction ] ?? defaultAnimationDirection;

	return {

		onEnter: ( item: HTMLElement, duration: number ): Promise<any> => {

			return new Promise( resolve => {

				gsap.set(item, {

					opacity: 0,
					x: 20 * animDir.x,
					y: 20 * animDir.y,
					immediateRender: true

				});

				gsap.to(item, {

					opacity: 1,
					x: 0,
					y: 0,
					duration: duration / 1000,
					onComplete: () => {

						resolve( item );

					}

				});

			} );

		},

		onLeave: ( item: HTMLElement, duration: number ): Promise<any> => {

			return new Promise( resolve => {

				gsap.to(item, {

					opacity: 0,
					x: 20 * animDir.x,
					y: 20 * animDir.y,
					duration: duration / 1000,
					onComplete: () => {

						resolve( item );

					}

				});

			});

		}

	};

};
