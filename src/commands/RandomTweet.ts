import Discord, { Message } from "discord.js";

import Core from "../cores/Core";
import AbstractCommand from "./AbstractCommand";

export default class RandomTweet extends AbstractCommand {

    public constructor() {
        super("randomtweet", "Request a random tweet related to the provided query", `${process.env.COMMAND_PREFIX} randomtweet [query]`, -1);
    }

    /**
     * Reply to user with random tweet.
     * @param channelId to send response to.
     * @param args of argument.
     */
    public async called(core: Core, message: Discord.Message, args: string[]): Promise<void> {
        await core.getTwitterManager().getRandomTweet(args.join(" "))
        .then((tweet) => {
            if (message.channel !== undefined) {
                const embed = new Discord.RichEmbed();
                embed.setTitle(`Selected tweet from query: ${args.join(" ")}`)
                .setColor(0x00AE86)
                .setDescription(tweet.text)
                .setFooter(`Brought to you by the engineers at Dotma! (dotma.me)`)
                .setTimestamp()
                .setURL(tweet.url);
                if (tweet.media !== undefined) {
                    embed.setImage(tweet.media);
                }
                message.channel.send(embed);
            }
        })
        .catch((err) => {
            message.channel.send({embed: {
                color: 0x00AE86,
                description: `Error: ${err}`,
            }});
        });
    }
}
