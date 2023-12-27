export declare function getKeyByValue(object: any, value: string): string;
export declare function renderAttributes(el: HTMLElement, tuples: [string, string][]): void;
export declare function getCoordsFromElement(el: HTMLElement): number[];
export declare function fireCustomEvent(eventName: string, data: any): void;
export declare function mapRowColIndicesToXY(rI: number, cI: number): number[];
export declare function mapXYToRowColIndices(x: number, y: number): number[];
export declare function insertStyles(): void;