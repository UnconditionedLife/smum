export declare function append<T extends unknown[]>(array: T, item: T[keyof T]): T;
export declare function removeIndex<T extends unknown[]>(array: T, indexItem: number): T;
export declare function updateIndex<T extends unknown[]>(array: T, indexItem: number, item: T[keyof T]): T;
