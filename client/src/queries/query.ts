export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) => fetch(p).then(toJson) as Promise<T>;
export const text = <T>(p: string) => fetch(p).then(toText) as Promise<T>;
export const blob = <T>(p: string) => fetch(p).then(toBlob) as Promise<T>;
