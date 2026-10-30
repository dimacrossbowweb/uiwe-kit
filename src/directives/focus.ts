// @ts-nocheck
export const vFocus = {

    ctx: null,

    mounted( el ) {

        el.addEventListener( 'focus', this.onFocus );

        el.focus();

    },

    updated( el ) {

        el.focus();

    },

    beforeUnmount ( el ) {

        el.removeEventListener( 'focus', this.onFocus );

    },

    onFocus( event: Event ) {

        try {

            const el: EventTarget = event?.target;

            if ( !( el instanceof HTMLElement ) ) {

                throw new Error( '[ vFocus.onFocus ] undefined target element. Expected HTMLElement' );

            }

            clearTimeout( this.ctx );

            this.ctx = setTimeout(() => {

                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            }, 300);

        } catch ( e: unknown ) {

            console.error( e );

        }

    },

};
