import { computed } from 'vue';

export function useMobile () {

    const isMobile = computed( () => {

        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    } );

    return {

        isMobile,

    };

}
