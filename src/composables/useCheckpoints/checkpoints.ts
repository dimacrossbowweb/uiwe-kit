import {

    type Ref,

    computed,
    isRef,

} from 'vue';

import {

    type TSectionValue,
    type TCheckpointSection,

} from './checkpoints.type';

function getNumberValue ( value: TSectionValue ): number {

    try {

        if ( typeof value === 'number' ) {

            return value;

        }

        if ( isRef( value ) && typeof value.value === 'number' ) {

            return value.value;

        }

        if ( isRef( value ) && typeof value.value === 'number' ) {

            return value.value;

        }

    } catch ( e: unknown ) {

        console.error( e );

    }

    return 0;

}

export function useCheckpoints(
  
    value: Ref<number>,
    sections: Record<string, TCheckpointSection> = {}

) {
  
    const sectionList = Object.entries(sections);

    const state = computed(() => {
    
        return sectionList.reduce<string[]>( ( prev, [ key, [ start, end ] ] ) => {

            const startValue: number = getNumberValue( start );
            const endValue: number = getNumberValue( end );

            if ( value.value >= startValue && value.value <= endValue ) {
        
                prev.push(key);
      
            }
      
            return prev;
        
        }, []);
  
    });

    const has = computed( () => ( name: string ) => {

        return state.value.includes( name );

    } );

    const less = computed( () => ( name: string, includes: boolean = false ) => {

        const checkpoint = sectionList.find( item => item[ 0 ] === name );

        if ( !checkpoint ) return false;

        let result: boolean = false;

        includes && ( result = value.value <= getNumberValue( checkpoint[1][1] ) );
        !includes && ( result = value.value < getNumberValue( checkpoint[1][0] ) );

        return result;

    } );

    const more = computed( () => ( name: string, includes: boolean = false ) => {

        const checkpoint = sectionList.find( item => item[ 0 ] === name );

        if ( !checkpoint ) return false;

        let result: boolean = false;

        includes && ( result = value.value >= getNumberValue( checkpoint[1][0] ) );
        !includes && ( result = value.value > getNumberValue( checkpoint[1][1] ) );

        return result;

    } );

    return {

        state,
        has,
        less,
        more,

    };

}
