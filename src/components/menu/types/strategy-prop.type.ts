export interface IBoundingBox {

    x: number;
    y: number;
    width: number;
    height: number;

};

export interface IStrategyProp {

    window: Omit<IBoundingBox, 'x' | 'y'>;
    activator: IBoundingBox;
    context: Omit<IBoundingBox, 'x' | 'y'>;
    margin: number;

};
