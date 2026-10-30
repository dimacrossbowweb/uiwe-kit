export class Calc {

	static sum( ...args: number[] ): number | typeof NaN {

		try {

			return args.reduce( ( prev: number, curr: number ) => {
				
				if ( typeof curr !== 'number' ) {

					throw new Error( `[ Calc.sum ] invalid argument. Expected "number", got "${ typeof curr }"` );

				}

				return prev + curr;
				
			}, 0 );

		} catch ( e: unknown ) {

			console.error( e );

		}

		return NaN;

	}

};
