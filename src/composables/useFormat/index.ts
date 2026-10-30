import {

	Color,
	Value,
	AspectRatio,
	Datetime,
	Duration,
	FileSize,

} from './entities';
import { type TColorFormat } from './types/color';

export function useFormat() {

	const isColorValid: ( value: string ) => boolean = ( value: any ): boolean => Color.validate( value );
	const isValueValid: ( value: string | number ) => boolean = ( value: any ): boolean => Value.validate( value );
	const isAspectValid: ( value: string ) => boolean = ( value: any ): boolean => AspectRatio.validate( value );
	const isDatetimeValid: ( value: string | number | Date ) => boolean = ( value: any ): boolean => Datetime.validate( value );
	const isDurationValid: ( value: string | number ) => boolean = ( value: any ): boolean => Duration.validate( value );
	const isFileSizeValid: ( value: string | number ) => boolean = ( value: any ): boolean => FileSize.validate( value );

	const parseColor = ( value: string, format?: TColorFormat ): Color => Color.parse( value, format );
	const parseValue = ( value: string | number, unit: ( string | null ) = 'px' ): Value => Value.parse( value, unit );
	const parseRatio = ( value: string ): ( AspectRatio | null ) => AspectRatio.parse( value );
	const parseDatetime = ( value: ( string | number | Date ) = new Date(), format: string = 'DD.MM.YYYY' ): Datetime => Datetime.parse( value, format ) as Datetime;
	const parseDuration = ( value: ( string | number | undefined | null ) = 0, fallback: number = 0): Duration => Duration.parse( value, fallback ) as Duration;
	const parseFileSize = ( value: ( string | number | undefined | null ) = 0, fallback: number = 0 ): FileSize => FileSize.parse( value, fallback ) as FileSize;

	return {

		isColorValid,
		isValueValid,
		isAspectValid,
		isDatetimeValid,
		isDurationValid,
		isFileSizeValid,

		parseColor,
		parseValue,
		parseRatio,
		parseDatetime,
		parseDuration,
		parseFileSize,

	};

}
