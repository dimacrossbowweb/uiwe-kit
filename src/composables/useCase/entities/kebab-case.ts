export class KebabCase {

	static validate ( str: string ): boolean {

		return /^[a-z]+(-[a-z]+)*$/.test( str );

	}

	static parse ( value: string ): string[] {

		return value.split( '-' );

	}

	static toString ( words: string[] ): string {

		return words
				.map( ( word: string ) => word.toLowerCase() )
				.join( '-' );

	}

};
