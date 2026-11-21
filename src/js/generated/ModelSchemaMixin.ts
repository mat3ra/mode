import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, BaseModel } from "@mat3ra/esse/dist/js/types";

export type ModelSchemaMixin = BaseModel;

export type ModelInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & ModelSchemaMixin>;

export function modelSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & ModelSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<ModelSchemaMixin> & ModelSchemaMixin = {
        get type() {
            return this.requiredProp("type");
        },
        set type(value: BaseModel["type"]) {
            this.setProp("type", value);
        },
        get subtype() {
            return this.requiredProp("subtype");
        },
        set subtype(value: BaseModel["subtype"]) {
            this.setProp("subtype", value);
        },
        get method() {
            return this.requiredProp("method");
        },
        set method(value: BaseModel["method"]) {
            this.setProp("method", InMemoryEntity.getDataForEntity(value));
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
