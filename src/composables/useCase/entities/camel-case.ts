export class CamelCase {

	static validate ( str: string ): boolean {

		return /^[a-z]+([A-Z][a-z]+)*$/.test( str );

	}

	static parse ( value: string ): string[] {

		return value
				.split( /(?=[A-Z])/ )
				.map( word => word.toLowerCase() );

	}

	static toString ( words: string[] ): string {

		return words
				.map( ( word: string, i: number ) => {

					if ( i === 0 ) return word.toLowerCase();
					
					return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

				} )
				.join( '_' );

	}

};
