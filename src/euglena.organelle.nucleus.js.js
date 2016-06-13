"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var euglena_template_1 = require("../node_modules/euglena/euglena_template/src/euglena_template");
var euglena_1 = require("../node_modules/euglena/euglena/src/euglena");
var path = require("path");
var Body = euglena_1.euglena.being.alive.Body;
var Gene = (function () {
    function Gene(name, triggers, // particle prop - value match
        reaction, override, expiretime) {
        this.name = name;
        this.triggers = triggers;
        this.reaction = reaction;
        this.override = override;
        this.expiretime = expiretime;
    }
    return Gene;
})();
exports.Gene = Gene;
var GarbageCollector = (function () {
    function GarbageCollector(chromosome) {
        //private timeout = 3600000;
        this.timeout = 1000;
        this.chromosome = [];
        this.chromosome = chromosome;
    }
    GarbageCollector.prototype.start = function () {
        var chromosome = this.chromosome;
        setInterval(function () {
            var toBeRemoved = [];
            for (var _i = 0; _i < chromosome.length; _i++) {
                var a = chromosome[_i];
                if (a.expiretime && euglena_1.euglena.sys.type.StaticTools.Time.biggerThan(euglena_1.euglena.sys.type.StaticTools.Time.now(), a.expiretime)) {
                    toBeRemoved.push(a.name);
                }
            }
            for (var _a = 0; _a < toBeRemoved.length; _a++) {
                var b = toBeRemoved[_a];
                for (var index = 0; index < chromosome.length; index++) {
                    var element = chromosome[index];
                    if (element.name === b) {
                        chromosome.splice(index, 1);
                        break;
                    }
                }
            }
        }, this.timeout);
    };
    return GarbageCollector;
})();
exports.GarbageCollector = GarbageCollector;
var Organelle = (function (_super) {
    __extends(Organelle, _super);
    function Organelle() {
        _super.call(this, "NucleusOrganelleImplJs");
    }
    Organelle.prototype.receive = function (particle, response) {
        if (particle.name === "LoadGenes") {
            this.loadGenes();
            return;
        }
        console.log("Organelle Nucleus says received particle " + particle.name);
        //find which genes are matched with properties of the particle 
        var triggerableReactions = new Array();
        for (var i = 0; i < this.chromosome.length; i++) {
            var triggers = this.chromosome[i].triggers;
            var matched = true;
            for (var key in triggers) {
                if ((particle[key] === triggers[key])) {
                    matched = true;
                    break;
                }
                matched = false;
            }
            if (matched) {
                var reaction = this.chromosome[i].reaction;
                triggerableReactions.push({ index: i, triggers: Object.keys(triggers), reaction: reaction });
            }
        }
        //get rid of overrided reactions
        var reactions = Array();
        for (var _i = 0; _i < triggerableReactions.length; _i++) {
            var tr = triggerableReactions[_i];
            var doTrigger = true;
            //Check if the tr is contained by others, if true
            for (var _a = 0; _a < triggerableReactions.length; _a++) {
                var tr2 = triggerableReactions[_a];
                //if it is the same object, do nothing 
                if (tr.index === tr2.index)
                    continue;
                //then if triggers of tr2 does not contain triggers of tr, do nothing
                if (!euglena_1.euglena.sys.type.StaticTools.Array.containsArray(tr2.triggers, tr.triggers))
                    continue;
                //then check if tr2 overrides tr
                doTrigger = !(this.chromosome[tr2.index].override === this.chromosome[tr.index].name);
            }
            if (doTrigger) {
                reactions.push(tr.reaction);
            }
        }
        //trigger collected reactions
        for (var _b = 0; _b < reactions.length; _b++) {
            var reaction_1 = reactions[_b];
            try {
                reaction_1(particle, Body.instance, response);
            }
            catch (e) {
                console.log(e);
                response(new euglena_template_1.euglena_template.being.alive.particles.Exception(new euglena_1.euglena.sys.type.Exception(e.message), this.name));
            }
        }
    };
    Organelle.prototype.loadGenes = function () {
        var chromosomeFile = this.initialProperties.chromosomeFile;
        if (!this.initialProperties.chromosomeFile) {
            var appDir = path.dirname(require.main.filename);
            chromosomeFile = path.join(appDir, '../', 'genes/chromosome');
        }
        this.chromosome = require(chromosomeFile).chromosome;
    };
    return Organelle;
})(euglena_template_1.euglena_template.being.alive.organelles.Nucleus);
exports.Organelle = Organelle;
//# sourceMappingURL=euglena.organelle.nucleus.js.js.map