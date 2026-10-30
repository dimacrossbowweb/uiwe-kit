export function useElevation ( elevation: string | number ): string {

	return `0px ${ elevation }px ${ +elevation * 2 }px #00000099`;

}
