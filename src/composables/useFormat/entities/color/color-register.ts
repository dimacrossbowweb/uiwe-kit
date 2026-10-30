import { ColorRgb } from './color-rgb';
import { colorByName } from '@/global/utils';

export class ColorRegister extends ColorRgb {

	constructor( r: number = 0, g: number = 0, b: number = 0, a: number = 0 ) {

		super( r, g, b, a );

	}

	static validate( value: string ): boolean {

		return !!colorByName( value );

	}

	static override parse( value: string ): ColorRgb {

		const color: ( string | null ) = colorByName( value );

		if ( !color ) {

			throw new Error( '[ColorRegister.parse] unknown color name' );

		}

		return ColorRgb.parse( color );

	}

}
