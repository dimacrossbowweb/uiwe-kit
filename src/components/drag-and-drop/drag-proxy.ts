import { defineComponent, getCurrentInstance } from 'vue';
import type { PropType, ComponentInternalInstance } from 'vue';

let self: ComponentInternalInstance | null = null

// The DOM-valued props below are declared `Object as PropType<HTMLElement>`
// rather than `type: HTMLElement`. Vue evaluates a prop's `type` constructor
// when the component is *defined*, so naming a DOM global there threw
// `ReferenceError: HTMLElement is not defined` the moment this module was
// imported in Node — breaking SSR and any server-side import of the package.
// `Object` is the correct runtime constructor for an element; `PropType` keeps
// the TypeScript side exact.
export default defineComponent({

	name: 'uiDragAndDropProxy',

	data: () => ( {

		cursorStyle: null as HTMLStyleElement | null,

	} ),

	setup() {

		self = getCurrentInstance();

	},

	props: {

		startPosition: {
			type: Object as PropType<{
				e: PointerEvent,
				x: number,
				y: number
			}>,
			required: true
		},

		cloneParent: { type: Object as PropType<HTMLElement>, required: true },

		mobile: { type: Object as PropType<HTMLElement>, required: true },

		directionX: { type: Boolean, required: true },
		directionY: { type: Boolean, required: true },

		eventStart: { type: Function, required: true },
		eventMove: { type: Function, required: true },
		eventStop: { type: Function, required: true },

		cursor: { type: Object,	required: true },

		srcRef: { type: Object as PropType<HTMLElement>, required: true },

	},

	mounted() {

		// document.body.style['pointer-events'] = 'none';
		// document.body.style['touch-action'] = 'none';
		document.body.style.userSelect = 'none';

		if (this.startPosition.e.pointerType === 'touch') {
			document.addEventListener( 'pointermove', this.onMove );
			document.addEventListener( 'pointerup', this.onUp );
		} else {
			document.addEventListener( 'mousemove', this.onMove );
			document.addEventListener( 'mouseup', this.onUp );
		}

		try { this.eventStart( this.prepareData( this.startPosition.e ) ); } catch {}

	},

	beforeUnmount() {

		// document.body.style.removeProperty('pointer-events');
		// document.body.style.removeProperty('touch-action');
		document.body.style.removeProperty('user-select');

		try { this.cloneParent.removeChild(this.mobile); } catch {}

		this.clearGlobalCursor();

		if (this.startPosition.e.pointerType === 'touch') {
			document.removeEventListener( 'pointermove', this.onMove );
			document.removeEventListener( 'pointerup', this.onUp );
		} else {
			document.removeEventListener( 'mousemove', this.onMove );
			document.removeEventListener( 'mouseup', this.onUp );
		}

		self = null;
  	
	},

	methods: {

		clearGlobalCursor() {

			if (!!this.cursorStyle) {
				document.head.removeChild( this.cursorStyle );
				this.cursorStyle = null;
			}

		},

		setGlobalCursor( val: CSSStyleDeclaration['cursor'] ) {

			this.clearGlobalCursor();

			this.cursorStyle = document.createElement('style');
			this.cursorStyle.textContent = `* { cursor: ${val} !important; }`;
			document.head.appendChild(this.cursorStyle);

		},

		onMove( e: MouseEvent | TouchEvent ) {

			let x: number, y:number;
			const mobile = this.mobile;

			if (e instanceof MouseEvent) {
				x = e.clientX;
				y = e.clientY;
			} else {
				const touch = e.touches[0];
				x = touch?.clientX ?? 0;
				y = touch?.clientY ?? 0;
			}

			if (this.directionX)
				mobile.style.left = `${x - this.startPosition.x}px`;

			if (this.directionY)
				mobile.style.top = `${y - this.startPosition.y}px`;

			try { this.eventMove( this.prepareData( e ) );  } catch {}

		},

		onUp ( e: MouseEvent | TouchEvent ) {

			try { this.eventStop( this.prepareData( e ) );  } catch {}
			if (self) self.appContext.app.unmount();
		
		},

		prepareData( e: PointerEvent | MouseEvent | TouchEvent ) {

			let x: number, y:number;

			if (e instanceof TouchEvent) {
				x = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
				y = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
			} else {
				x = e.clientX;
				y = e.clientY;
			}

			// Call sites pass a possibly-null attribute value, and `{}` when there is
			// no element at all. `JSON.parse` already ToString-coerces its argument,
			// so `String()` keeps that behaviour while satisfying its signature.
			const getJSONObject = (str: unknown) => {

				let result = {}
				try {

					result = JSON.parse(String(str));
				
				} catch {}

				return result;

			}

			const elements = document.elementsFromPoint(x, y).filter( element => element instanceof HTMLElement );
			let area: HTMLElement | null = null;
			let otherElement: HTMLElement | null = null;
			// `getAttribute` may return null; `String()` preserves the "null" coercion
			// that `includes()` performed implicitly before.
			const areaName = String( this.mobile.getAttribute('area-name-element') );

			// `for ... of` rather than `forEach`: assignments made inside a callback
			// are invisible to control-flow analysis, which would leave `area` /
			// `otherElement` narrowed to `null` for the rest of the method.
			for (const element of elements) {

				let attr = element.getAttribute('area-name');

				if (!area && !!attr && ( attr.includes( areaName ) /* || areaName.includes( attr ) */ ) )
					area = element;

				attr = element.getAttribute('drag-and-drop-element');
				const areaNameElement = element.getAttribute('area-name-element');

				if (!otherElement && attr !== null
					&& element !== this.mobile
					&& areaNameElement !== null && areaNameElement.includes( areaName )
				)
					otherElement = element

			}

			if (!!this.mobile) {

				if (!area && !otherElement)
					this.setGlobalCursor(this.cursor.outsideZone);
				else
					this.setGlobalCursor(this.cursor.startMoved);
			}

			return {
				event: e,
				mobile: this.mobile,
				src: {
					component: this.srcRef,
					payload: getJSONObject( this.mobile.getAttribute('drag-and-drop-element') )
				},
				dst: {
					el: otherElement,
					payload: getJSONObject( !!otherElement ? otherElement.getAttribute('drag-and-drop-element') : {} )
				},
				area: area,

			};

		}

	},
	
	render() {

		return null;
	
	},

});