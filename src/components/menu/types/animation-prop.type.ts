import { type TDirection } from './direction.type';

export interface IAnimationBox {

	onEnter: ( el: HTMLElement, duration: number ) => Promise<any>;
	onLeave: ( el: HTMLElement, duration: number ) => Promise<any>;

};

export interface IAnimationProp {

	direction: TDirection;

};
