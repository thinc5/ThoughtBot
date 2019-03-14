// @ts-ignore
const Chain = require("markovchain");

import Discord, { DMChannel, TextChannel } from "discord.js";
import TwitterClient from "twitter";

import Core from "./Core";
import { ITweetData } from "../../types/ITweetData";

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

    /**
     * Interval at which the bot lets its thoughts be known.
     */
    private interval: number;

    public constructor(core: Core) {
        this.core = core;
        this.progress = 0;
        this.interval = 1000 * 60 * parseInt(process.env.UPDATE_INTERVAL_MINS as string, 10);
    }

    /**
     * Start thinking when core is ready.
     */
    public start(): void {
        // Status and avatar updates
        setInterval(() => {
            this.progress++;
        }, this.interval / 100);
        setInterval(() => {
            this.progressUpdate();
        }, 1000 * 4);   // Only update every 4 seconds.
        setInterval(() => {
            this.avatarUpdate();
        }, (1000 * 60 * 30)); // Only update every 30 minutes.
        // Thinking updates every four hours
        setInterval(() => {
            this.retrieveMaterial();
        }, (this.interval / 6));
        setInterval(() => {
            this.giveOpinion();
            this.progress = 0;
        }, (this.interval));
    }

    /**
     * Private retrieval of unrelated materials.
     * TODO: Hard coded for LA right now, will have it be customizable by server eventually.
     */
    public async retrieveMaterial(): Promise<void> {
        try {
            const trends: string[] = [];
            const results: TwitterClient.ResponseData = await this.core.getTwitterManager().getTrendingTags("2442047");
            const rawTrends = (results[0].trends).slice(0, parseInt(process.env.NUMBER_OF_HASHTAGS as string, 10));
            rawTrends.forEach((trend: any) => {
                trends.push(`${trend.name}`);
            });
            if (trends === []) {
                console.error("Failed to gather trends.");
                return;
            }
            const data: ITweetData[] = await this.core.getTwitterManager().getMaterialByTweet(trends);
            await this.core.getDBCore().storeTweets(data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Give current opinion and forget everything else.
     */
    public async giveOpinion(): Promise<void> {
        // Get opinion.
        const tweet = await this.processMaterial();
        // Let all registered channels know.
        const targets: string[] = this.core.getDBCore().getRegisteredChannels();
        for (const target of targets) {
            const channel: Discord.Channel | undefined = this.core.getBot().channels.get(target);
            if (channel !== undefined && channel.type === "text") {
                const dm = channel as Discord.TextChannel;
                const embed: Discord.RichEmbed = new Discord.RichEmbed();
                embed.setTitle(`This is my unique opinion: `)
                .setColor(0x00AE86)
                .setDescription(tweet)
                .setFooter(`Brought to you by the engineers at Dotma! (dotma.me)`)
                .setTimestamp()
                .setURL("https://www.dotma.me");
                dm.send(embed);
            }
        }
        // Clear the database
        await this.core.getDBCore().forgetTweets();
    }

    /**
     * Think time...
     */
    private async processMaterial(): Promise<string> {
        // Get stored tweets.
        const raw: string[] = await this.core.getDBCore().retrieveTweets();
        // Remove all newlines, and quotes.
        const words: string[] = (raw.join(" ").replace(/\n/g, "").replace(/"/g, "")).split(" ");
        // Get the starting word of the tweet to getnerate.
        const index: number = Math.floor(Math.random() * (words.length - 1));
        const start: string = words[index];
        // Instantiate the markov chain and parse the total words as a stirng.
        const quotes = new Chain(words.join(" "));
        return quotes.start(start).end(50).process();
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
        if (this.progress < 35) {
            this.core.updateAvatar("res/main.jpg");
        } else if (this.progress < 50) {
            this.core.updateAvatar("res/soy.png");
        } else if (this.progress < 75) {
            this.core.updateAvatar("res/angry.png");
        } else if (this.progress < 85) {
            this.core.updateAvatar("res/smug.png");
        } else {
            this.core.updateAvatar("res/really_mad.jpg");
        }
    }

}
