import { Block, Element } from './entities';

export interface IUseBemResult {

	block: Block;
	element: ( elementName: string, options?: Record<string, any> ) => Element;

};

export function useBem( blockName: string, _options: Record<string, any> = {} ): IUseBemResult {

	try {

		if ( typeof blockName !== 'string' || !blockName.trim() ) {

			throw new Error( 'useBem :: invalid block class. Expected not empty string' );

		}

	} catch ( e: unknown ) {

		console.error( e );

	}

	const block: Block = new Block( blockName );

	const element = function ( elementName: string, _options: Record<string, any> = {} ): Element {

		return new Element( block, elementName );

	};

	return {

		block,
		element,

	};

};
