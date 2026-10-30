import { describe, it, expect } from 'vitest'
import { Value, Duration, FileSize } from '@/composables/useFormat/entities'

describe( 'Value', () => {

	it( 'parses a unit-suffixed string', () => {
		expect( Value.parse( '10px' ).toString() ).toBe( '10px' )
		expect( Value.parse( '1.5rem' ).toString() ).toBe( '1.5rem' )
	} )

	it( 'applies the default unit to a bare number', () => {
		expect( Value.parse( 10 ).toString() ).toBe( '10px' )
		expect( Value.parse( 10, 'em' ).toString() ).toBe( '10em' )
	} )

	it( 'passes the "auto" keyword through unitless', () => {
		expect( Value.parse( 'auto' ).toString() ).toBe( 'auto' )
	} )

	it( 'validates numbers and known units, rejects junk', () => {
		expect( Value.validate( 10 ) ).toBe( true )
		expect( Value.validate( '10px' ) ).toBe( true )
		expect( Value.validate( '10zz' ) ).toBe( false )
		expect( Value.validate( 'abc' ) ).toBe( false )
	} )

} )

describe( 'Duration', () => {

	it( 'treats a bare number as milliseconds', () => {
		expect( Duration.parse( 5000 ).ms ).toBe( 5000 )
		expect( Duration.parse( 5000 ).valueOf() ).toBe( 5000 )
	} )

	it( 'converts seconds to milliseconds', () => {
		expect( Duration.parse( '2s' ).ms ).toBe( 2000 )
	} )

	it( 'falls back on empty / invalid input', () => {
		expect( Duration.parse( null, 42 ).ms ).toBe( 42 )
		expect( Duration.parse( '', 7 ).ms ).toBe( 7 )
	} )

	it( 'validates numeric and unit strings', () => {
		expect( Duration.validate( 100 ) ).toBe( true )
		expect( Duration.validate( '2s' ) ).toBe( true )
		expect( Duration.validate( 'abc' ) ).toBe( false )
	} )

} )

describe( 'FileSize', () => {

	it( 'scales bytes to the best-fitting unit', () => {
		expect( FileSize.parse( 500 ).toString() ).toBe( '500 B' )
		expect( FileSize.parse( 2048 ).toString() ).toBe( '2 KB' )
		expect( FileSize.parse( 1572864 ).toString() ).toBe( '1.5 MB' )
	} )

	it( 'parses unit-suffixed strings back to bytes', () => {
		expect( FileSize.parse( '1.5mb' ).bytes ).toBe( 1.5 * 1024 ** 2 )
		expect( FileSize.parse( '240 KB' ).bytes ).toBe( 240 * 1024 )
	} )

	it( 'clamps negatives and falls back on junk', () => {
		expect( FileSize.parse( -100 ).bytes ).toBe( 0 )
		expect( FileSize.parse( 'nope', 128 ).bytes ).toBe( 128 )
	} )

	it( 'forces a concrete unit via format()', () => {
		expect( FileSize.parse( 1048576 ).format( 'KB' ) ).toBe( '1024 KB' )
	} )

	it( 'validates byte-like input', () => {
		expect( FileSize.validate( 1024 ) ).toBe( true )
		expect( FileSize.validate( '240 KB' ) ).toBe( true )
		expect( FileSize.validate( 'abc' ) ).toBe( false )
	} )

} )
