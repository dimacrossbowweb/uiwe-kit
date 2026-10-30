<template>

    <div v-bind="mainAttrs">

        <div v-bind="prependAttrs">

            <slot

                name="button"

                :playing="playing"
                :toggle="toggle"
                :on-click="toggle"

            >

                <ui-btn

                    icon
                    :color="color"
                    :size="size"
                    rounded="100%"
                    flat
                    :disabled="disabled"

                    @click="toggle"

                >

                    <ui-icon :name="playing ? 'pause' : 'play'" />

                </ui-btn>

            </slot>

        </div>

        <div v-bind="contentAttrs">

            <div v-bind="headerAttrs">

                <slot name="header">

                    <div v-bind="authorAttrs">

                        <ui-text color="text-primary">{{ author }}</ui-text>

                    </div>

                    <div v-bind="trackAttrs">

                        <ui-text
                        
                            color="text-secondary"
                            size="12"
                            
                        >
                        
                            {{ track }}
                        
                        </ui-text>

                    </div>

                </slot>

            </div>

            <div v-bind="bodyAttrs">

                <slot

                    name="timeline"
                    :current-time="currentTime"
                    :duration="duration"
                    :progress="progress"
                    :seek="seek"
                    :on-input="seek"

                >

                    <ui-range

                        width="100%"
                        :min="0"
                        :max="duration"
                        :disabled="disabled"
                        v-model="progress"
                        :color="color"

                    />

                </slot>

            </div>

            <div v-bind="footerAttrs">

                <slot name="footer"></slot>

            </div>

        </div>

        <div v-bind="appendAttrs">

            <span v-bind="timeAttrs">

                <slot

                    name="time"

                    :current-time="currentTime"
                    :duration="duration"
                    :current="currentLabel"
                    :total="totalLabel"

                >{{ currentLabel }} / {{ totalLabel }}</slot>

            </span>

            <div

                @mouseenter="displayAudio = !disabled"
                @mouseleave="displayAudio = false"
                v-bind="volumeAttrs"

            >

                <ui-btn

                    icon
                    plain
                    rounded="100%"
                    :disabled="disabled"

                    @click="toggleMute"

                >

                    <ui-icon

                        :name="volumeIcon"

                    />

                </ui-btn>

                <ui-expansion

                    v-model="displayAudio"
                    row

                >

                    <div class="py-2 px-1">

                        <ui-range

                            width="80"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :disabled="disabled"
                            :color="color"
                            v-model="volume"

                        />

                    </div>

                </ui-expansion>

            </div>

        </div>

        <audio

            ref="audio"
            v-bind="audioAttrs"

            @play="onPlay"
            @pause="onPause"
            @timeupdate="onTimeupdate"
            @loadedmetadata="onLoadedmetadata"
            @durationchange="onLoadedmetadata"
            @volumechange="onVolumechange"
            @ended="onEnded"

        >

            <slot></slot>

        </audio>

    </div>

</template>

<script lang="ts" setup>
import {
    ref,
    computed,
    watch,
    onMounted,
    useAttrs,
    useSlots,
} from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';
import { useCSSVar } from '@/composables/useCSSVar';

interface IProps {

	theme: 'auto' | 'light' | 'dark';

    namespace: string;
    author: string;
    track: string;
    width: string | number;
    size: string | number;
    color: string;
    disabled: boolean;
    loading: boolean;
    autoplay: boolean;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

	theme: 'auto',

    namespace: '',
    author: '',
    track: '',
    width: '100%',
    size: 28,
    color: 'brand',
    disabled: false,
    loading: false,
    autoplay: false,

} );

const attrs = useAttrs();

const slots = useSlots();

const namespace = computed( () => props?.namespace ?? '' );
const author = computed( () => props?.author ?? '' );
const track = computed( () => props?.track ?? '' );

const disabled = computed( () => !!props?.disabled );

// Grayscale the whole widget while disabled.
const filter = computed( () => disabled.value ? 'grayscale( 50% )' : 'none' );

const audio = ref<HTMLAudioElement>();

const playing = ref<boolean>( false );
const currentTime = ref<number>( 0 );
const duration = ref<number>( 0 );

const displayAudio = ref<boolean>( false );

// Output volume in the 0..1 range expected by HTMLMediaElement.volume.
const volume = ref<number>( 1 );
// Remembers the level before muting so the speaker button can restore it.
const lastVolume = ref<number>( 1 );

const volumeIcon = computed( () => {

    if ( volume.value <= 0 )    return 'volume-off';
    if ( volume.value < 0.34 )  return 'volume-low';
    if ( volume.value < 0.67 )  return 'volume-medium';

    return 'volume-high';

} );

// Two-way bridge for <ui-range>: reads the current playback position and
// seeks the track when the user drags the thumb.
const progress = computed<number>( {

    get: () => currentTime.value,
    set: ( value: number ) => seek( value ),

} );

const currentLabel = computed( () => formatTime( currentTime.value ) );
const totalLabel = computed( () => formatTime( duration.value ) );

const { block, element } = useBem( 'UiAudio' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

const prependClass = computed( () => {

    return element( 'prepend' )
            .mix( namespace.value )
            .classify();

} );

const prependAttrs = computed( () => ( {

    'class': prependClass.value,

} ) );

const contentClass = computed( () => {

    return element( 'content' )
            .mix( namespace.value )
            .classify();

} );

const contentAttrs = computed( () => ( {

    'class': contentClass.value,

} ) );

const headerClass = computed( () => {

    return element( 'header' )
            .mix( namespace.value )
            .classify();

} );

const headerAttrs = computed( () => ( {

    'class': headerClass.value,

} ) );

const authorClass = computed( () => {

    return element( 'author' )
            .mix( namespace.value )
            .classify();

} );

const authorAttrs = computed( () => ( {

    'class': authorClass.value,

} ) );

const trackClass = computed( () => {

    return element( 'track' )
            .mix( namespace.value )
            .classify();

} );

const trackAttrs = computed( () => ( {

    'class': trackClass.value,

} ) );

const bodyClass = computed( () => {

    return element( 'body' )
            .mix( namespace.value )
            .classify();

} );

const bodyAttrs = computed( () => ( {

    'class': bodyClass.value,

} ) );

const footerClass = computed( () => {

    return element( 'footer' )
            .mix( namespace.value )
            .classify();

} );

const footerAttrs = computed( () => ( {

    'class': footerClass.value,

} ) );

const appendClass = computed( () => {

    return element( 'append' )
            .mix( namespace.value )
            .classify();

} );

const appendAttrs = computed( () => ( {

    'class': appendClass.value,

} ) );

const timeClass = computed( () => {

    return element( 'time' )
            .mix( namespace.value )
            .classify();

} );

const timeAttrs = computed( () => ( {

    'class': timeClass.value,

} ) );

const volumeClass = computed( () => {

    return element( 'volume' )
            .mix( namespace.value )
            .classify();

} );

const volumeAttrs = computed( () => ( {

    'class': volumeClass.value,

} ) );

const audioClass = computed( () => {

    return element( 'audio' )
            .mix( namespace.value )
            .classify();

} );

const audioAttrs = computed( () => ( {

    'class': audioClass.value,
    ...attrs,

} ) );

/**
** Toggle playback of the underlying <audio> element.
**/
function toggle (): void {

    if ( disabled.value || !audio.value ) return;

    audio.value.paused
        ? audio.value.play()
        : audio.value.pause();

}

/**
** Start playback. play() resolves once the browser has data; rejections
** ( e.g. autoplay policy ) are swallowed so a blocked autoplay is harmless.
**/
function play (): void {

    if ( disabled.value || !audio.value ) return;

    audio.value.play().catch( () => {} );

}

/**
** Seek the track to the given position ( seconds ).
**/
function seek ( value: number ): void {

    if ( disabled.value || !audio.value ) return;

    audio.value.currentTime = value;

}

/**
** Push the current volume onto the <audio> element.
**/
function applyVolume (): void {

    if ( !audio.value ) return;

    audio.value.volume = volume.value;

}

/**
** Mute / unmute, restoring the previous level on unmute.
**/
function toggleMute (): void {

    if ( disabled.value ) return;

    if ( volume.value > 0 ) {

        lastVolume.value = volume.value;
        volume.value = 0;

    } else {

        volume.value = lastVolume.value || 1;

    }

}

function onVolumechange (): void {

    // Keep the slider in sync when volume changes from outside ( e.g. OS / API ).
    if ( audio.value ) volume.value = audio.value.volume;

}

watch( volume, applyVolume );

// Child <source> mounts before this hook, so the element already has its track.
// Paired with a :key on the source URL, the widget remounts per track and thus
// autoplays each newly opened one.
onMounted( () => {

    if ( props.autoplay ) play();

} );

function onPlay (): void {

    playing.value = true;

}

function onPause (): void {

    playing.value = false;

}

function onTimeupdate (): void {

    currentTime.value = audio.value?.currentTime ?? 0;

}

function onLoadedmetadata (): void {

    const value: number = audio.value?.duration ?? 0;

    duration.value = isFinite( value ) ? value : 0;

    applyVolume();

}

function onEnded (): void {

    playing.value = false;
    currentTime.value = 0;

}

/**
** Format a duration in seconds as m:ss.
**/
function formatTime ( seconds: number ): string {

    if ( !isFinite( seconds ) || seconds < 0 ) seconds = 0;

    const minutes: number = Math.floor( seconds / 60 );
    const rest: number = Math.floor( seconds % 60 );

    return `${ minutes }:${ rest.toString().padStart( 2, '0' ) }`;

}

defineExpose( {

    toggle,
    play,
    seek,
    playing,
    currentTime,
    duration,
    disabled,

} );

</script>

<style lang="scss" scoped>
.ui-audio {

    display: flex;
    align-items: center;
    gap: 8px;

    filter: v-bind( filter );

    &__prepend {

        flex-grow: 0;
        flex-shrink: 0;

    }

    &__content {

        display: flex;
        flex-direction: column;

        flex-grow: 1;
        flex-shrink: 1;

        gap: 4px;

    }

        &__header {

            display: flex;
            flex-direction: column;

            padding: 12px 0;

        }

    &__append {

        display: flex;
        gap: 4px;
        align-items: center;

        flex-grow: 0;
        flex-shrink: 0;

    }

    &__time {

        font-variant-numeric: tabular-nums;
        white-space: nowrap;

    }

    &__volume {

        display: flex;
        align-items: center;
        gap: 4px;

    }

    &__audio {

        display: none;

    }

}

</style>
