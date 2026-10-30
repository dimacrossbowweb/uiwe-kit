export class SnakeCase {

	static validate ( str: string ): boolean {

		return /^[a-z]+(_[a-z]+)*$/.test( str );

	}

	static parse ( value: string ): string[] {

		return value.split( '_' );

	}

	static toString ( words: string[] ): string {

		return words
				.map( ( word: string ) => word.toLowerCase() )
				.join( '_' );

	}

};
