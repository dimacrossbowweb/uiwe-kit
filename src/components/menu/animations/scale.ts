import gsap from 'gsap';
import {
	
	type IAnimationProp,
	type IAnimationBox,

} from '../types/animation-prop.type';
import { type TDirection } from '../types/direction.type';

interface IAnimationDirection {

	x: 0 | 1;
	y: 0 | 1;
	transformOrigin: string;

};

// `TDirection` widens to `string`, so an unrecognised direction misses the map.
// bottom-start is the menu's default placement and doubles as the fallback.
const defaultAnimationDirection: IAnimationDirection = { x: 1, y: 0, transformOrigin: 'center top' };

const animationDirections: Record<TDirection, IAnimationDirection> = {

	'bottom-start': defaultAnimationDirection,
	'bottom-center': { x: 1, y: 0, transformOrigin: 'center top' },
	'bottom-end': { x: 1, y: 0, transformOrigin: 'center top' },

	'top-start': { x: 1, y: 0, transformOrigin: 'center top' },
	'top-center': { x: 1, y: 0, transformOrigin: 'center top' },
	'top-end': { x: 1, y: 0, transformOrigin: 'center tops' },

	'left-up': { x: 0, y: 1, transformOrigin: 'left center' },
	'left-center': { x: 0, y: 1, transformOrigin: 'left center' },
	'left-dowm': { x: 0, y: 1, transformOrigin: 'left center' },

	'right-up': { x: 0, y: 1, transformOrigin: 'left center' },
	'right-center': { x: 0, y: 1, transformOrigin: 'left center' },
	'right-dowm': { x: 0, y: 1, transformOrigin: 'left center' },

	'center': { x: 1, y: 0, transformOrigin: 'center' },

};

export const createScaleAnimation = (
	props: IAnimationProp
): IAnimationBox => {

	const animDir: IAnimationDirection = animationDirections[ props.direction ] ?? defaultAnimationDirection;

	return {

		onEnter: ( item: Node, duration: number ): Promise<any> => {

			return new Promise( resolve => {

				gsap.set(item, {

					opacity: 0,
					scaleX: animDir.x,
					scaleY: animDir.y,
					transformOrigin: animDir.transformOrigin,
					immediateRender: false,
					onComplete: () => {

						resolve( item );

					}

				});

				gsap.to(item, {

					opacity: 1,
					scaleX: 1,
					scaleY: 1,
					transformOrigin: animDir.transformOrigin,
					duration: duration / 1000,
					onComplete: () => {

						resolve( item );

					}

				});

			});

		},

		onLeave: ( item: Node, duration: number ): Promise<any> => {

			return new Promise( resolve => {

				gsap.to(item, {

					opacity: 0,
					scaleX: animDir.x,
					scaleY: animDir.y,
					transformOrigin: animDir.transformOrigin,
					duration: duration / 1000,
					onComplete: () => {

						resolve( item );

					}

				});

			});

		}

	};

};
