export class PascalCase {

	static validate ( str: string ): boolean {

		return /^[A-Z][a-zA-Z]+$/.test( str );

	}

	static parse ( value: string ): string[] {

		return value
			.split(/(?=[A-Z])/)
			.map( ( word: string ) => word.toLowerCase() );

	}

	static toString ( words: string[] ): string {

		return words
				.map( ( word: string ) => {
					
					return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

				} )
				.join( '_' );

	}

};
