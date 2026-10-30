import {

    type ComputedRef,
    type Ref,

} from 'vue';

export type TSectionValue = number | Ref<number> | ComputedRef<number>;

export type TCheckpointSection = [TSectionValue, TSectionValue];
