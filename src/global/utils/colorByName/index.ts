import { htmlReservedColors } from '../../../config/colors';
import { type INameValue } from '../../types';

export function colorByName ( name: string ): ( string | null ) {

	return htmlReservedColors.find( ( item: INameValue<string> ) => item.name.trim().toLowerCase() === name.trim().toLowerCase() )?.value || null;

}
