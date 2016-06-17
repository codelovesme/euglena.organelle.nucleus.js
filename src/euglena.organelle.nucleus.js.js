/// <reference path="../typings/node/node.d.ts" />
"use strict";
const euglena_template_1 = require("euglena.template");
const euglena_1 = require("euglena");
const path = require("path");
var Body = euglena_1.euglena.being.alive.Body;
class Gene {
    constructor(name, triggers, // particle prop - value match
        reaction, override, expiretime) {
        this.name = name;
        this.triggers = triggers;
        this.reaction = reaction;
        this.override = override;
        this.expiretime = expiretime;
    }
}
exports.Gene = Gene;
class GarbageCollector {
    constructor(chromosome) {
        //private timeout = 3600000;
        this.timeout = 1000;
        this.chromosome = [];
        this.chromosome = chromosome;
    }
    start() {
        let chromosome = this.chromosome;
        setInterval(() => {
            let toBeRemoved = [];
            for (let a of chromosome) {
                if (a.expiretime && euglena_1.euglena.sys.type.StaticTools.Time.biggerThan(euglena_1.euglena.sys.type.StaticTools.Time.now(), a.expiretime)) {
                    toBeRemoved.push(a.name);
                }
            }
            for (let b of toBeRemoved) {
                for (var index = 0; index < chromosome.length; index++) {
                    var element = chromosome[index];
                    if (element.name === b) {
                        chromosome.splice(index, 1);
                        break;
                    }
                }
            }
        }, this.timeout);
    }
}
exports.GarbageCollector = GarbageCollector;
class Organelle extends euglena_template_1.euglena_template.being.alive.organelles.Nucleus {
    constructor() {
        super("NucleusOrganelleImplJs");
    }
    receive(particle, response) {
        if (particle.name === "LoadGenes") {
            this.loadGenes(response);
            return;
        }
        console.log("Organelle Nucleus says received particle " + particle.name);
        //find which genes are matched with properties of the particle 
        let particleAny = particle;
        let triggerableReactions = new Array();
        for (var i = 0; i < this.chromosome.length; i++) {
            let triggers = this.chromosome[i].triggers;
            let matched = true;
            for (let key in triggers) {
                if ((particleAny[key] === triggers[key])) {
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
        let reactions = Array();
        for (let tr of triggerableReactions) {
            let doTrigger = true;
            //Check if the tr is contained by others, if true
            for (let tr2 of triggerableReactions) {
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
        for (let reaction of reactions) {
            try {
                reaction(particle, Body.instance, response);
            }
            catch (e) {
                console.log(e);
                response(new euglena_template_1.euglena_template.being.alive.particles.Exception(new euglena_1.euglena.sys.type.Exception(e.message), this.name));
            }
        }
    }
    loadGenes(response) {
        let chromosomeFile = this.initialProperties.chromosomeFile;
        if (!this.initialProperties.chromosomeFile) {
            let appDir = path.dirname(require.main.filename);
            chromosomeFile = path.join(appDir, '../', 'genes/chromosome');
        }
        this.chromosome = require(chromosomeFile).chromosome;
        response(new euglena_template_1.euglena_template.being.alive.particles.Acknowledge("nucleus"));
    }
}
exports.Organelle = Organelle;
//# sourceMappingURL=euglena.organelle.nucleus.js.js.map