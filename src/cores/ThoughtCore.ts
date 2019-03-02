// @ts-ignore
import * as MarkovChain from "markovchain";

import Core from "./Core";

/**
 * @classdesc Facilitates original thought :^)
 */
export default class ThoughtCore {

    /**
     * Reference to core.
     */
    private core: Core;

    /**
     * Current progress to thought completion.
     */
    private progress: number;

    public constructor(core: Core) {
        this.core = core;
        this.progress = 55;
    }

    /**
     * Start thinking when core is ready.
     */
    public start(): void {
        // Status and avatar updates
        setInterval(() => {
            this.progressUpdate();
        }, 1000 * 4);   // Only update every 4 seconds.
        setInterval(() => {
            this.avatarUpdate();
        }, (1000 * 60 * 30)); // Only update every 30 minutes.
        // Thinking updates every four hours
        setInterval(() => { // Update DB every four hours.
            this.retrieveMaterial();
        }, (1000 * 60 * 60 * 4));
        setInterval(() => {
            this.giveOpinion();
        }, (1000 * 60 * 60 * 24));
    }

    /**
     * Private retrieval of unrelated materials.
     * TODO: Hardcoded for LA right now, will have it be customisable by server eventually.
     */
    private async retrieveMaterial(): Promise<void> {
        let trends: string[] = [];
        await this.core.getTwitterManager().getTrendingTags("2442047")
        .then((tags) => {
            trends = tags.split(2);
        })
        .catch((err) => {
            console.error(err);
        });
        if (trends === []) {
            console.error("Failed to gather trends.");
            return;
        }
        await this.core.getTwitterManager().getMaterialByTweet(trends)
        .then((data) => {
            this.core.getDBCore().storeTweets(data);
        })
        .catch((err) => {
            console.error(err);
        });
    }

    /**
     * Give current opinion and forget everything else.
     */
    private giveOpinion(): void {
        // Get opinion.
        this.processMaterial();
        // Forget everything.
        this.core.getDBCore().forgetTweets();
    }

    /**
     * Think time...
     */
    private processMaterial(): void {
        // Get stored tweets.
        
        const quotes = new MarkovChain();
        const tweet = quotes.start().end(50).process();
        return;
    }

    /**
     * Update the bot's status.
     */
    private progressUpdate(): void {
        let bar = "..........";
        const base = "##########";
        const bars = Math.floor(this.progress / 10);
        bar = base.substr(0, bars) + bar.substr(bars);
        this.core.updateActivity(`[${bar}] ${this.progress}%`);
        setTimeout(() => {
            this.core.updateActivity(`% help`);
        }, 2000);
    }

    /**
     * Update bots avatar based off status.
     */
    private avatarUpdate(): void {
        if (this.progress < 50) {
            this.core.updateAvatar("res/main.png");
        } else if (this.progress < 60) {
            this.core.updateAvatar("res/soy.png");
        } else if (this.progress < 80) {
            this.core.updateAvatar("res/smug.png");
        } else {
            this.core.updateAvatar("res/angry.png");
        }
    }

}
