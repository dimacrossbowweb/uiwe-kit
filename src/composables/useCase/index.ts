import {

	KebabCase,
	SnakeCase,
	CamelCase,
	PascalCase,

} from './entities';

type TCase = 'kebab-case' | 'snake-case' | 'camel-case' | 'pascal-case';

export function useCase() {

	function convert( value: string, caseType: TCase = 'kebab-case' ): string {

		let words: string[] = [];

		if ( KebabCase.validate( value ) ) {

			words = KebabCase.parse( value );

		}

		if ( SnakeCase.validate( value ) ) {

			words = SnakeCase.parse( value );

		}

		if ( CamelCase.validate( value ) ) {

			words = CamelCase.parse( value );

		}

		if ( PascalCase.validate( value ) ) {

			words = PascalCase.parse( value );

		}

		if ( caseType === 'kebab-case' ) return KebabCase.toString( words );
		if ( caseType === 'snake-case' ) return SnakeCase.toString( words );
		if ( caseType === 'camel-case' ) return CamelCase.toString( words );
		if ( caseType === 'pascal-case' ) return PascalCase.toString( words );

		return value;

	}

	return { convert };

}
