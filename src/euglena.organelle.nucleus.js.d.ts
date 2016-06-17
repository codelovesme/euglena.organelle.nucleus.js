/// <reference path="../typings/node/node.d.ts" />
import { euglena_template } from "euglena.template";
import { euglena } from "euglena";
import interaction = euglena.being.interaction;
import Particle = euglena.being.Particle;
import Body = euglena.being.alive.Body;
import Time = euglena.sys.type.Time;
export interface Reaction {
    (particle: Particle, body: Body, response: interaction.Response): void;
}
export declare class Gene implements euglena.sys.type.Named {
    name: string;
    triggers: Object;
    reaction: Reaction;
    override: string;
    expiretime: Time;
    constructor(name: string, triggers: Object, reaction: Reaction, override?: string, expiretime?: Time);
}
export declare class GarbageCollector {
    private timeout;
    private chromosome;
    constructor(chromosome: Gene[]);
    start(): void;
}
export declare class Organelle extends euglena_template.being.alive.organelles.Nucleus {
    private time;
    private chromosome;
    constructor();
    receive(particle: Particle, response: interaction.Response): void;
    private loadGenes(response);
}
