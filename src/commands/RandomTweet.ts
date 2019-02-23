import Discord, { Message } from "discord.js";

import Core from "../cores/Core";
import AbstractCommand from "./AbstractCommand";

export default class RandomTweet extends AbstractCommand {

    public constructor() {
        super("randtweet", "duh", "% randtweet [query]", 1);
    }

    /**
     * Reply to user with random tweet.
     * @param channelId to send response to.
     * @param args of argument.
     */
    public async called(core: Core, channel: string, args: string[]) : Promise<void> {
        const channelTarget: Discord.TextChannel = core.getBot().channels.get(channel) as Discord.TextChannel;
        if (channelTarget !== undefined) {
            if (channelTarget.type == "text") {
                await core.getTwitterInstance().getRandomTweet(args[0], (tweet) => {
                    if (channel !== undefined) {
                       channelTarget.send(tweet);
                    }
                });
            }
        }
    }

}
