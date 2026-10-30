import {

	type Ref,

	onMounted,
	onBeforeUnmount,
	nextTick,

} from 'vue';

/**
 * Adds a material-style ripple to an element carrying the `pulsed` class.
 *
 * The element ref is nullable: template refs start out null and only settle on
 * mount, so every access is guarded rather than asserted.
 */
export function usePulsation( el: Ref<HTMLElement | null> ): boolean {

	let wrapper: HTMLDivElement | null = null;

  	function onClick( e: MouseEvent ): void {

		const event = e || window.event;

    	event.stopPropagation();

		const element = el.value;

    	if ( wrapper && element ) {

			// Clear any ripple still animating from a previous click.
      		const ripples: HTMLCollection = wrapper.getElementsByClassName( 'ripple' );

      		while ( ripples.length > 0 ) {

				const ripple = ripples[ 0 ];
				if ( !ripple?.parentNode ) break;

				ripple.parentNode.removeChild( ripple );

			}

			const circle: HTMLSpanElement = document.createElement( 'span' );

			const diameter: number = Math.max( element.clientWidth, element.clientHeight );

			const radius: number = diameter / 2;

			const rect = element.getBoundingClientRect();

			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			circle.style.width = circle.style.height = `${ diameter }px`;
			circle.style.left = `${ x - radius }px`;
			circle.style.top = `${ y - radius }px`;

			circle.classList.add( 'ripple' );

			wrapper.appendChild(circle);

		}

  	}

	function onClassChange( classAttrValue: string ) {

		// This was `split( '' )`, which yields one entry per character — so the
		// `includes( 'pulsed' )` check below could never be true and the ripple
		// never re-bound on a class change.
		const classList = classAttrValue.split( ' ' );

		const element = el.value;
		if ( !element ) return;

		element.removeEventListener( 'mousedown', onClick );

		if ( classList.includes( 'pulsed' ) ) {

			element.addEventListener( 'mousedown', onClick );

		}

	}

	try {

		let observer: MutationObserver | null = null;

		onMounted( (): void => {

			nextTick( (): void => {

				const element = el.value;
				if ( !element ) return;

				const style = window.getComputedStyle( element );

        		if ( style.getPropertyValue( 'position' ) === 'static' ) {

					element.style.position = 'relative';

        		}

        		wrapper = document.createElement( 'div' );

        		wrapper.classList.add( 'ripple-wrapper' );

				element.insertBefore( wrapper, element.firstChild );

        		observer = new MutationObserver( ( mutations: MutationRecord[] ) => {

         			for ( const m of mutations ) {

						const target = m.target as Element;
						const attrName = m.attributeName ?? '';
						const newValue = target.getAttribute( attrName ) ?? '';

            			nextTick((): void => {

							onClassChange( newValue );

						});

					}

				});

				observer.observe( element, {

					attributes: true,
					attributeOldValue: true,
					attributeFilter: [ 'class' ],

				});

				if ( element.classList.contains( 'pulsed' ) && !element.onclick ) {

					element.addEventListener( 'click', onClick );

				}

      		});

		});

    	onBeforeUnmount( (): void => {

			observer?.disconnect();

			const element = el.value;
			if ( !element ) return;

			element.removeEventListener( 'click', onClick );
			element.removeEventListener( 'mousedown', onClick );

			// The wrapper is only a child while the element is still mounted.
			if ( wrapper && wrapper.parentNode === element ) {

				element.removeChild( wrapper );

			}

		});

    	return true;

	} catch ( e: unknown ) {

    	console.error( e );

	}

  	return false;

}
