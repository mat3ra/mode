import { WorkflowStandata } from "@mat3ra/standata";
import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";

import { Model } from "../../src/js/model";
import { DFTModel } from "../../src/js/models/dft";
import { ModelFactory } from "../../src/js/models/factory";
import { ModelConfig } from "../../src/js/types";

const BAND_GAP_WORKFLOW_NAME = "Band Gap";

describe("Model", () => {
    // @ts-ignore
    const obj: ModelConfig = { type: "dft" };

    it("can be created", () => {
        const app = new Model(obj);
        expect(app.type).to.equal("dft");
    });

    describe("modelSchemaMixin property access", () => {
        it("should return string for type property", () => {
            const model = new Model({ type: "dft", subtype: "gga" });
            const typeValue = model.type;

            expect(typeValue).to.be.a("string");
            expect(typeValue).to.equal("dft");
        });

        it("should return string or object for subtype property", () => {
            const model = new Model({ type: "dft", subtype: "gga" });
            const subtypeValue = model.subtype;

            expect(subtypeValue).to.exist;
            expect(subtypeValue).to.equal("gga");
        });

        it("should return Method instance for method property", () => {
            const model = new Model({
                type: "dft",
                subtype: "gga",
                method: { type: "pseudopotential", subtype: "nc" },
            });

            const methodValue = model.Method;

            // Check that method is an instance, not a plain object
            expect(methodValue).to.exist;
            expect(methodValue.constructor.name).to.not.equal("Object");

            // Check that it has Method class methods
            expect(methodValue).to.have.property("setSearchText");
            // @ts-ignore
            expect(methodValue).to.have.property("setData");
            expect(methodValue.setData).to.be.a("function");
        });
    });

    describe("DFTModel with method", () => {
        it("should return Method instance (not plain object) for method property", () => {
            const dftModel = new DFTModel({
                type: "dft",
                subtype: "gga",
                functional: "pbe",
                method: { type: "pseudopotential", subtype: "nc" },
            });

            const methodValue = dftModel.Method;

            // Check that method is an instance, not a plain object
            expect(methodValue).to.exist;
            expect(methodValue.constructor.name).to.not.equal("Object");

            // Check that it has Method class methods
            expect(methodValue).to.have.property("setSearchText");
            expect(methodValue.setSearchText).to.be.a("function");
        });
    });

    it("a change made on Method is in the method data", () => {
        const model = new Model({
            type: "dft",
            subtype: "gga",
            method: { type: "pseudopotential", subtype: "us" },
        });

        model.Method.setSearchText("Si");

        expect(model.method).to.have.nested.property("data.searchText", "Si");
    });

    it("a change made on one default model's Method is not in another's", () => {
        new Model({ type: "dft", subtype: "gga" }).Method.setSearchText("Si");

        expect(new Model({ type: "dft", subtype: "gga" }).method).to.not.have.nested.property(
            "data.searchText",
        );
    });

    it("calculateHash matches fixture", () => {
        const fixture = JSON.parse(
            readFileSync(resolve(__dirname, "../fixtures/model_hash.json"), "utf-8"),
        );
        const standata = new WorkflowStandata();
        const workflows = standata.findEntitiesByTags(
            fixture.standata.application,
            fixture.standata.workflow,
        );
        const wfConfig = workflows.find((wf) => wf.name === BAND_GAP_WORKFLOW_NAME);
        expect(wfConfig).to.exist;
        const model = ModelFactory.create(wfConfig!.subworkflows[0].model);
        expect(model.calculateHash()).to.equal(fixture.hash);
    });
});
