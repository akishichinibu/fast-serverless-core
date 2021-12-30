export type ClzType<R> = { new (...args: any[]): R };

export type ClzerType = (...params: any[]) => ClzType<any>;

export type Nullable<T> = T | null;

export type Handler = (...args: any[]) => Promise<any>;
