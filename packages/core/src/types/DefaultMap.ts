export class DefaultMap<K, V> {
    private map: Map<K, V>;

    constructor(
        entries: [K, V][] | null,
        private defaultFactory: () => V
    ) {
        this.map = new Map(entries);
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) {
            this.map.set(key, this.defaultFactory());
        }
        let out = this.map.get(key);
        return out;
    }

    set(key: K, value: V) {
        this.map.set(key, value);
    }

    [Symbol.iterator]() {
        return this.map[Symbol.iterator]();
    }
}
