"use strict";
import {euglena_template} from "../node_modules/euglena/euglena_template/src/euglena_template";
import {euglena} from "../node_modules/euglena/euglena/src/euglena";
import * as path from "path";
import * as fs from "fs";
import interaction = euglena.being.interaction;
import Particle = euglena.being.Particle;
import ParticleReference = euglena.being.alive.dna.ParticleReference;
import Body = euglena.being.alive.Body;
import sys = euglena.sys;
import Time = euglena.sys.type.Time;

export interface Reaction {
    (particle: Particle, body: Body, response: interaction.Response): void;
}

export class Gene implements euglena.sys.type.Named {
    constructor(
        public name: string,
        public triggers: Object, // particle prop - value match
        public reaction: Reaction,
        public override?: string,
        public expiretime?: Time) { }
}

export class GarbageCollector {
    //private timeout = 3600000;
    private timeout = 1000;
    private chromosome: Gene[] = [];
    constructor(chromosome: Gene[]) {
        this.chromosome = chromosome;
    }
    public start(): void {
        let chromosome = this.chromosome;
        setInterval(() => {
            let toBeRemoved: string[] = [];
            for (let a of chromosome) {
                if (a.expiretime && euglena.sys.type.StaticTools.Time.biggerThan(
                    euglena.sys.type.StaticTools.Time.now(),
                    a.expiretime
                )) {
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
        }, this.timeout)
    }
}

export class Organelle extends euglena_template.being.alive.organelles.Nucleus {
    private time: euglena.sys.type.Time;
    private chromosome: Gene[];
    constructor() {
        super("NucleusOrganelleImplJs");
    }
    public receive(particle: Particle, response: interaction.Response) {

        if (particle.name === "LoadGenes") {
            this.loadGenes();
            return;
        }

        console.log("Organelle Nucleus says received particle " + particle.name);
        //find which genes are matched with properties of the particle 
        let triggerableReactions = new Array<{ index: number, triggers: string[], reaction: Reaction }>();
        for (var i = 0; i < this.chromosome.length; i++) {
            let triggers = this.chromosome[i].triggers;
            let matched = true;
            for (let key in triggers) {
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
        let reactions = Array<Reaction>();
        for (let tr of triggerableReactions) {
            let doTrigger = true;
            //Check if the tr is contained by others, if true
            for (let tr2 of triggerableReactions) {
                //if it is the same object, do nothing 
                if (tr.index === tr2.index) continue;
                //then if triggers of tr2 does not contain triggers of tr, do nothing
                if (!euglena.sys.type.StaticTools.Array.containsArray(tr2.triggers, tr.triggers)) continue;
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
            } catch (e) {
                console.log(e);
                response(new euglena_template.being.alive.particles.Exception(new euglena.sys.type.Exception(e.message), this.name));
            }
        }
    }
    private loadGenes(): void {
        let chromosomeFile = this.initialProperties.chromosomeFile;
        if (!this.initialProperties.chromosomeFile) {
            let appDir = path.dirname(require.main.filename);
            chromosomeFile = path.join(appDir, '../', 'genes/chromosome');
        }
        this.chromosome = require(chromosomeFile).chromosome;
    }
}