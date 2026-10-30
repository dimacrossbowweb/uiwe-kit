import { ColorBase } from './color-base';
import { type IColorKeyword } from '../../types/color';


const TColorKeywordTypes: string[] = [

	'auto', 'transparent', 'currentColor'

];

type TColorKeyword = typeof TColorKeywordTypes[ number ];

// CSS keywords are case-insensitive: compare lower-cased on both sides.
// Comparing against `'currentColor'` as written meant that very keyword was
// never recognised and fell through to the opaque-black fallback.
function isKeyword( value: string ): boolean {

	const v = value.trim().toLowerCase();
	return TColorKeywordTypes.some( k => k.toLowerCase() === v );

}

export class ColorKeyword extends ColorBase implements IColorKeyword {

	value!: string;

	constructor( value: TColorKeyword = 'auto' ) {

		super( 'keyword-color' );

		this.value = value;

	}

	static validate( value: string ): boolean {

		return isKeyword( value );

	}

	static parse( value: string ): ColorKeyword {

		if ( !isKeyword( value ) ) {

			throw new Error( '[ColorKeyword.parse] invalid value.' );

		}

		return new ColorKeyword( value );

	}

	toString(): string {

		return this.value;

	}

}
