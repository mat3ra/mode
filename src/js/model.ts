import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import {
    type HashedEntity,
    hashedEntityMixin,
} from "@mat3ra/code/dist/js/entity/mixins/HashedEntityMixin";
import type {
    ApplicationSchema,
    BaseInMemoryEntitySchema,
    BaseMethod,
    BaseModel,
    SlugifiedEntry,
    SlugifiedEntryOrSlug,
} from "@mat3ra/esse/dist/js/types";
import lodash from "lodash";

import { UnknownMethodConfig } from "./default_methods";
import { DFTModelConfig } from "./default_models";
import { type ModelSchemaMixin, modelSchemaMixin } from "./generated/ModelSchemaMixin";
import { Method } from "./method";
import { MethodFactory } from "./methods/factory";
import { getTreeByApplicationNameAndVersion, MODEL_TREE, treeSlugToNamedObject } from "./tree";
import type { MethodTreeBranch, ModelConfig, ModelTree } from "./types";

const EMPTY_BRANCH: MethodTreeBranch = { methods: {} };

export type ModelEntity = BaseInMemoryEntitySchema &
    Pick<BaseModel, "method"> & {
        type: string;
        subtype: SlugifiedEntryOrSlug;
        refiners?: SlugifiedEntry[];
        modifiers?: SlugifiedEntry[];
        functional?: string;
    };

export interface Model extends ModelSchemaMixin, HashedEntity {}

export class Model extends InMemoryEntity<ModelEntity> implements BaseModel {
    protected _application?: ApplicationSchema;

    protected _MethodFactory: typeof MethodFactory;

    protected _method?: Method;

    constructor(config: ModelConfig) {
        const { application, method: methodFromConfig, ...entityConfig } = config;
        // Method.defaultConfig is a pseudopotential method. An unknown model has no method tree,
        // so it must not inherit that default or the workflow designer offers pseudopotential
        // selection for applications that have no model.
        const method =
            methodFromConfig ??
            (config.type === "unknown" ? UnknownMethodConfig : Method.defaultConfig);
        super({ ...entityConfig, method } as ModelEntity);
        this._application = application;
        this._MethodFactory = MethodFactory;
        this.method = method || this.method;
    }

    setSubtype(subtype: SlugifiedEntryOrSlug): void {
        // TODO-question: subtype is a string, but we're setting it to a SlugifiedEntryOrSlug
        this.setProp("subtype", subtype);
        this.setMethod(this._MethodFactory.create(this.defaultMethodConfig));
    }

    get allowedTypes(): SlugifiedEntry[] {
        return Object.keys(this.tree).map((modelSlug) => treeSlugToNamedObject(modelSlug));
    }

    get allowedSubtypes(): SlugifiedEntry[] {
        return Object.keys(this.treeBranchForType).map((slug) => treeSlugToNamedObject(slug));
    }

    get defaultType(): string {
        return this.allowedTypes[0]?.slug || "";
    }

    get defaultSubtype(): string {
        return this.allowedSubtypes[0]?.slug || "";
    }

    get tree(): ModelTree {
        if (this._application) {
            const treeByApplication = this.treeByApplicationNameAndVersion;
            if (treeByApplication) return treeByApplication;
        }
        return MODEL_TREE;
    }

    get treeBranchForType(): Record<string, MethodTreeBranch> {
        return this.tree[this.type] || {};
    }

    get treeBranchForSubType(): MethodTreeBranch {
        return this.treeBranchForType[this.subtypeSlug] || EMPTY_BRANCH;
    }

    get treeByApplicationNameAndVersion(): ModelTree | undefined {
        if (!this._application) return undefined;
        const { name, version } = this._application;
        return getTreeByApplicationNameAndVersion({ name, version });
    }

    get groupSlug(): string {
        const subtype = this.subtypeSlug;
        if (!this._application) return `${this.type}:${subtype}`;
        return `${this._application.shortName}:${this.type}:${subtype}`;
    }

    get Method(): Method {
        if (!this._method) {
            this._method = this._MethodFactory.create(this.method);
        }
        return this._method;
    }

    setMethod(method: Method): void {
        this._method = method;
        this.setProp("method", method.toJSON());
    }

    get methodsFromTree(): Record<string, string[]> {
        return this.treeBranchForSubType.methods || {};
    }

    get methodTypes(): SlugifiedEntry[] {
        return Object.keys(this.methodsFromTree).map((type) => treeSlugToNamedObject(type));
    }

    get methodSubtypes(): SlugifiedEntry[] {
        const { type } = this.method as Method;
        const subtypes = this.methodsFromTree[type] || [];
        return subtypes.map((slug) => treeSlugToNamedObject(slug));
    }

    get defaultMethodConfig(): BaseMethod {
        const methodTypes = Object.keys(this.methodsFromTree);
        const type = methodTypes[0];
        if (!type) return Method.defaultConfig;
        const subtype = this.methodsFromTree[type]?.[0];
        if (!subtype) return Method.defaultConfig;
        return { type, subtype };
    }

    static get defaultConfig() {
        return {
            ...DFTModelConfig,
            method: Method.defaultConfig,
        };
    }

    static get allTypes(): SlugifiedEntry[] {
        return Object.keys(MODEL_TREE).map((modelSlug) => treeSlugToNamedObject(modelSlug));
    }

    toJSON(): ModelEntity {
        return {
            ...super.toJSON(),
            type: this.type,
            subtype: this.subtype,
            method: this.Method.toJSONWithCleanData(),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    protected _stringToSlugifiedObject(slug: SlugifiedEntryOrSlug): SlugifiedEntry {
        if (lodash.isString(slug)) {
            return { slug } as SlugifiedEntry;
        }
        return slug;
    }

    get isUnknown(): boolean {
        return this.type === "unknown";
    }

    protected get subtypeSlug(): string {
        const subtype = this.subtype as SlugifiedEntryOrSlug;
        return typeof subtype === "string" ? subtype : subtype.slug;
    }

    getHashObject(): Record<string, unknown> {
        const json = this.toJSON() as unknown as Record<string, unknown>;
        json.method = this.Method.calculateHash();
        return json;
    }
}

modelSchemaMixin(Model.prototype);
hashedEntityMixin(Model.prototype);
