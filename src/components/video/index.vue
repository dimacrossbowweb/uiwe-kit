<template>

    <ui-hover v-slot="{ hover }">

        <div
        
            ref="root"
            v-bind="mainAttrs"
            tabindex="0"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            
        >

            <video

                ref="video"
                v-bind="videoAttrs"

                @play="onPlay"
                @pause="onPause"
                @timeupdate="onTimeupdate"
                @loadedmetadata="onLoadedmetadata"
                @durationchange="onLoadedmetadata"
                @volumechange="onVolumechange"
                @ended="onEnded"

            >

                <slot></slot>

            </video>

            <div v-bind="toolsAttrs( hover )">

                <div v-bind="overlayAttrs">

                    <slot name="overlay">

                        <ui-overlay

                            color="#000000"
                            width="100%"
                            height="100%"
                            intangible

                        />

                    </slot>

                </div>

                <div v-bind="headerAttrs">

                    <slot name="title">

                        <span class="text-primary">{{ videoTitle }}</span>

                    </slot>

                    <ui-space />

                    <slot name="tools">

                        <ui-menu direction="bottom-end">

                            <template #activator="{ setRef, onShow, onLeave }">

                                <ui-btn

                                    :ref="setRef"
                                    @mouseenter="onShow"
                                    @mouseleave="onLeave"
                                    icon
                                    plain
                                    rounded="100%"

                                >
                            
                                    <ui-icon name="dots-vertical" />

                                </ui-btn>

                            </template>

                            <template #content>

                                <slot name="menu">

                                    <ui-card class="px-2 py-2" rounded="12">

                                        <ui-list>

                                            <ui-list-item>

                                                <template #icon>
                                                
                                                    <ui-icon name="download-outline" />

                                                </template>

                                                <template #title>{{ downloadText }}</template>

                                            </ui-list-item>

                                            <ui-menu direction="right-up">

                                                <template #activator="{ setRef, onShow, onLeave }">

                                                    <ui-list-item
                                                    
                                                        :ref="setRef"
                                                        @mouseenter="onShow"
                                                        @mouseleave="onLeave"

                                                    >

                                                        <template #icon>
                                                        
                                                            <ui-icon name="play-speed" />

                                                        </template>

                                                        <template #title>{{ playbackSpeedText }}</template>

                                                        <template #append>
                                                        
                                                            <span class="text-secondary">{{ playbackRate }}x</span>

                                                        </template>

                                                    </ui-list-item>

                                                </template>

                                                <template #content>

                                                    <ui-card class="px-2 py-2" rounded="12">

                                                        <ui-list>

                                                            <ui-list-item
                                                                v-for="rate in playbackRates"
                                                                :key="rate"
                                                                :active="playbackRate === rate"
                                                                @click="setPlaybackRate(rate)"
                                                            >

                                                                <template #title>{{ rate }}x</template>

                                                            </ui-list-item>

                                                        </ui-list>

                                                    </ui-card>

                                                </template>

                                            </ui-menu>

                                            <ui-list-item>

                                                <template #icon>
                                                
                                                    <ui-icon name="information-outline" />

                                                </template>

                                                <template #title>{{ aboutFileText }}</template>

                                            </ui-list-item>

                                        </ui-list>

                                    </ui-card>

                                </slot>

                            </template>

                        </ui-menu>

                    </slot>

                </div>

                <div @click="toggle" v-bind="bodyAttrs"></div>

                <div @mouseleave="displayVolume = false" v-bind="footerAttrs">

                    <ui-btn

                        plain
                        icon
                        rounded="100%"
                        :disabled="disabled"

                        @click="toggle"

                    >

                        <ui-icon :name="playing ? 'pause' : 'play'" />

                    </ui-btn>

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

                    <div v-bind="timeAttrs">

                        <slot

                            name="time"

                            :current-time="currentTime"
                            :duration="duration"
                            :current="currentLabel"
                            :total="totalLabel"

                        >{{ currentLabel }} / {{ totalLabel }}</slot>

                    </div>

                    <div
                    
                        @mouseenter="displayVolume = true"
                        class="d-flex items-center"
                        
                    >

                        <ui-btn

                            icon
                            plain
                            rounded="100%"
                            @click="toggleMute"

                        >

                            <ui-icon

                                :name="volumeIcon"

                            />

                        </ui-btn>

                        <ui-expansion
                        
                            v-model="displayVolume"
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

                    <ui-btn

                        @click="toggleZoom"
                        icon
                        rounded="100%"
                        plain

                    >
                
                        <ui-icon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
                
                    </ui-btn>

                </div>

            </div>
            
        </div>

    </ui-hover>

</template>

<script lang="ts" setup>
import {
    ref,
    computed,
    watch,
    useAttrs,
    onMounted,
    onUnmounted,
} from 'vue';
import { useFormat } from '@/composables/useFormat';
import { useBem } from '@/composables/useBem';

interface IProps {

    theme: 'auto' | 'light' | 'dark';

    namespace: string;
    width: string | number;
    height: string | number;
    color: string;
    disabled: boolean;
    title: string;

    /**
     * Labels for the overflow menu.
     *
     * These were `$t( 'ui.download' )` / `'ui.playbackSpeed'` / `'ui.aboutFile'`,
     * which made the component depend on vue-i18n being installed with those
     * exact keys present — a hard coupling a library cannot make. They are plain
     * props now, so callers localise them themselves.
     */
    downloadText: string;
    playbackSpeedText: string;
    aboutFileText: string;

};

const props = withDefaults( defineProps<Partial<IProps>>(), {

    theme: 'auto',

    namespace: '',
    width: 'auto',
    height: 'auto',
    color: 'brand',
    disabled: false,
    title: '',

    downloadText: 'Download',
    playbackSpeedText: 'Playback speed',
    aboutFileText: 'About file',

} );

const attrs = useAttrs();

const downloadText = computed( () => props.downloadText );
const playbackSpeedText = computed( () => props.playbackSpeedText );
const aboutFileText = computed( () => props.aboutFileText );

const namespace = computed( () => props?.namespace ?? '' );

const { parseValue } = useFormat();

const width = computed( () => parseValue( props?.width ).toString() );
const height = computed( () => parseValue( props?.height ).toString() );
const color = computed( () => props?.color ?? 'brand' );
const disabled = computed( () => !!props?.disabled );

const video = ref<HTMLVideoElement>();
const root = ref<HTMLDivElement>();

const playing = ref<boolean>( false );
const currentTime = ref<number>( 0 );
const duration = ref<number>( 0 );
const playbackRate = ref<number>( 1 );

const displayVolume = ref<boolean>( false );

const volume = ref<number>( 1 );
const lastVolume = ref<number>( 1 );

const isFullscreen = ref<boolean>( false );
const isFocused = ref<boolean>( false );
const isHovered = ref<boolean>( false );

const videoTitle = ref<string>('');

const playbackRates: number[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const volumeIcon = computed( () => {

    if ( volume.value <= 0 )    return 'volume-off';
    if ( volume.value < 0.34 )  return 'volume-low';
    if ( volume.value < 0.67 )  return 'volume-medium';

    return 'volume-high';

} );

const progress = computed<number>( {

    get: () => currentTime.value,
    set: ( value: number ) => seek( value ),

} );

const { block, element } = useBem( 'UiVideo' );

const mainClass = computed( () => {

    return block
            .mix( namespace.value )
            .m( 'disabled', disabled.value )
            .classify();

} );

const mainAttrs = computed( () => ( {

    'class': mainClass.value,

} ) );

const videoClass = computed( () => {

    return element( 'video' )
            .mix( namespace.value )
            .classify();

} );

const videoAttrs = computed( () => ( {

    'class': videoClass.value,
    ...attrs,

} ) );

const toolsClass = ( hovered: boolean ) => {

    return element( 'tools' )
            .mix( namespace.value )
            .m( 'hovered', hovered )
            .classify();

};

const toolsAttrs = ( hovered: boolean ) => ( {

    'class': toolsClass( hovered ),

} );

const overlayClass = computed( () => {

    return element( 'overlay' )
            .mix( namespace.value )
            .classify();

} );

const overlayAttrs = computed( () => ( {

    'class': overlayClass.value,

} ) );

const headerClass = computed( () => {

    return element( 'header' )
            .mix( namespace.value )
            .classify();

} );

const headerAttrs = computed( () => ( {

    'class': headerClass.value,

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

const timeClass = computed( () => {

    return element( 'time' )
            .mix( namespace.value )
            .classify();

} );

const timeAttrs = computed( () => ( {

    'class': timeClass.value,

} ) );

function formatTime ( seconds: number ): string {

    if ( !isFinite( seconds ) || seconds < 0 ) seconds = 0;

    const minutes: number = Math.floor( seconds / 60 );
    const rest: number = Math.floor( seconds % 60 );

    return `${ minutes }:${ rest.toString().padStart( 2, '0' ) }`;

}

const currentLabel = computed( () => formatTime( currentTime.value ) );
const totalLabel = computed( () => formatTime( duration.value ) );

function toggle (): void {

    if ( disabled.value || !video.value ) return;

    video.value.paused
        ? video.value.play()
        : video.value.pause();

}

function toggleZoom (): void {

    if (!root.value) return;

    if (!isFullscreen.value) {
        if (root.value.requestFullscreen) {
            root.value.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

}

function onFullscreenChange (): void {

    isFullscreen.value = document.fullscreenElement === root.value;

}

function seek ( value: number ): void {

    if ( disabled.value || !video.value ) return;

    video.value.currentTime = value;

}

function applyVolume (): void {

    if ( !video.value ) return;

    video.value.volume = volume.value;

}

function setPlaybackRate ( rate: number ): void {

    if ( !video.value ) return;

    playbackRate.value = rate;
    video.value.playbackRate = rate;

}

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

    if ( video.value ) volume.value = video.value.volume;

}

watch( volume, applyVolume );

function onPlay (): void {

    playing.value = true;

}

function onPause (): void {

    playing.value = false;

}

function onTimeupdate (): void {

    currentTime.value = video.value?.currentTime ?? 0;

}

function onLoadedmetadata (): void {

    const value: number = video.value?.duration ?? 0;

    duration.value = isFinite( value ) ? value : 0;

    applyVolume();

    if (video.value) {
        video.value.playbackRate = playbackRate.value;
    }

    if (props.title) {

        videoTitle.value = props.title;

    } else if (video.value?.title) {

        videoTitle.value = video.value.title;

    } else if (video.value?.src) {

        const src = video.value.src;
        const fileName = src.split('/').pop() || '';
        videoTitle.value = fileName.replace(/\.[^/.]+$/, '');

    }
    
    if ('mediaSession' in navigator && videoTitle.value) {

        navigator.mediaSession.metadata = new MediaMetadata({
            title: videoTitle.value,
            artist: '',
            album: '',
            artwork: []
        });

    }

}

function onEnded (): void {

    playing.value = false;
    currentTime.value = 0;

}

function isComponentActive (): boolean {

    return isFocused.value || isHovered.value || isFullscreen.value;

}

function onKeydown (event: KeyboardEvent): void {

    if (!isComponentActive()) return;

    if (event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
        toggle();
    }

    if (event.code === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        seek(currentTime.value - 5);
    }

    if (event.code === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        seek(currentTime.value + 5);
    }

    if (event.code === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        volume.value = Math.min(1, volume.value + 0.1);
    }

    if (event.code === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        volume.value = Math.max(0, volume.value - 0.1);
    }

    if (event.code === 'KeyM') {
        event.preventDefault();
        event.stopPropagation();
        toggleMute();
    }

    if (event.code === 'KeyF') {
        event.preventDefault();
        event.stopPropagation();
        toggleZoom();
    }

}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('keydown', onKeydown);
});

defineExpose( {

    toggle,
    seek,
    playing,
    currentTime,
    duration,
    disabled,
    playbackRate,
    setPlaybackRate,

} );

</script>

<style lang="scss" scoped>
.ui-video {

    $selector: &;

    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;

    width: v-bind( width );
    height: v-bind( height );

    overflow: hidden;

    background: #111;

    &:focus {
        outline: none;
    }

    &__video {

        width: 100%;
        height: 100%;

        object-fit: contain;

    }

    &__tools {

        display: flex;
        flex-direction: column;

        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        overflow: hidden;

        opacity: 0;

        transition: opacity .3s;

        &_hovered {

            opacity: 1;

            #{ $selector }__footer {

                transform: translateY( 0 );

            }

        }

        #{ $selector }__overlay {

            opacity: 1;
            pointer-events: auto;

        }

    }

        &__overlay {

            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;

            transition: opacity 0.2s ease;

            opacity: 0;

        }

            &__header,
            &__body,
            &__footer {

                position: relative;
                z-index: 1;

            }

            &__header {

                display: flex;
                gap: 4px;
                align-items: center;

                padding: 4px 6px 4px 12px;
                box-sizing: border-box;

                flex-grow: 0;
                flex-shrink: 0;

            }

            &__body {

                display: flex;
                justify-content: center;
                align-items: center;

                padding: 4px 6px 4px 12px;
                box-sizing: border-box;

                flex-grow: 1;
                flex-shrink: 1;

                transition: opacity 0.2s ease;

            }

            &__footer {

                display: flex;
                gap: 4px;
                align-items: center;

                padding: 4px 6px 4px 12px;
                box-sizing: border-box;

                flex-grow: 0;
                flex-shrink: 0;

                transition: transform .3s;

                transform: translateY( 100% );

            }

                &__time {

                    font-variant-numeric: tabular-nums;
                    white-space: nowrap;

                }

}

</style>