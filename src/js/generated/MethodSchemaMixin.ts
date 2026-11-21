import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, BaseMethod } from "@mat3ra/esse/dist/js/types";

export type MethodSchemaMixin = Omit<BaseMethod, "precision" | "data"> & {
    get precision(): BaseMethod["precision"];
    set precision(value: BaseMethod["precision"] | InMemoryEntity);
    get data(): BaseMethod["data"];
    set data(value: BaseMethod["data"] | InMemoryEntity);
};

export type MethodInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & MethodSchemaMixin>;

export function methodSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & MethodSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<MethodSchemaMixin> & MethodSchemaMixin = {
        get type(): BaseMethod["type"] {
            return this.requiredProp("type");
        },
        set type(value: BaseMethod["type"]) {
            this.setProp("type", value);
        },
        get subtype(): BaseMethod["subtype"] {
            return this.requiredProp("subtype");
        },
        set subtype(value: BaseMethod["subtype"]) {
            this.setProp("subtype", value);
        },
        get precision(): BaseMethod["precision"] {
            return this.prop("precision");
        },
        set precision(value: BaseMethod["precision"] | InMemoryEntity) {
            this.setProp("precision", InMemoryEntity.getDataForEntity(value));
        },
        get data(): BaseMethod["data"] {
            return this.prop("data");
        },
        set data(value: BaseMethod["data"] | InMemoryEntity) {
            this.setProp("data", InMemoryEntity.getDataForEntity(value));
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
