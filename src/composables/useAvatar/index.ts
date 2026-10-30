

export function useAvatar (): any {

	return {

		reduction: function ( name: string ): string {

			if ( typeof name === 'string' && !!name ) {

				// split() always yields at least one element, but the index
				// signature does not express that — hence the ?? '' guards.
				const parts = name.trim().split(' ');
				const first = ( parts[ 0 ] ?? '' ).trim();

				if ( parts.length > 1 ) {

					const second = ( parts[ 1 ] ?? '' ).trim();

					return [ first.charAt( 0 ), second.charAt( 0 ) ]
						.join('').toUpperCase();

				} else {

					return [ first.charAt( 0 ), first.charAt( 1 ) ]
						.join( '' ).toUpperCase();

				}

			}

			return '';

		}

	};

};
