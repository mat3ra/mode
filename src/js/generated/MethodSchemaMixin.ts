import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, BaseMethod } from "@mat3ra/esse/dist/js/types";

export type MethodSchemaMixin = BaseMethod;

export type MethodInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & MethodSchemaMixin>;

export function methodSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & MethodSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<MethodSchemaMixin> & MethodSchemaMixin = {
        get type() {
            return this.requiredProp("type");
        },
        set type(value: BaseMethod["type"]) {
            this.setProp("type", value);
        },
        get subtype() {
            return this.requiredProp("subtype");
        },
        set subtype(value: BaseMethod["subtype"]) {
            this.setProp("subtype", value);
        },
        get precision() {
            return this.prop("precision");
        },
        set precision(value: BaseMethod["precision"]) {
            this.setProp("precision", InMemoryEntity.getDataForEntity(value));
        },
        get data() {
            return this.prop("data");
        },
        set data(value: BaseMethod["data"]) {
            this.setProp("data", InMemoryEntity.getDataForEntity(value));
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
