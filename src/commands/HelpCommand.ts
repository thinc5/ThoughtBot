import Discord from "discord.js";

import AbstractCommand from "./AbstractCommand";
import Core from "../cores/Core";

export default class Help extends AbstractCommand {

    public constructor() {
        super("help", "Displays commands", `${process.env.COMMAND_PREFIX} help`, 0);
    }

    /**
     * Reply to user with random tweet.
     * @param channelId to send response to.
     * @param args of argument.
     */
    public async called(core: Core, message: Discord.Message, args: string[]): Promise<void> {
        const commands = core.getCommandManager().getCommands();
        let embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .setDescription(`All commands of the bot.`)
            .setFooter(`Brought to you by the engineers at Dotma! (dotma.me)`);
        commands.forEach((c) => {
            embed.addField(c.split(" ")[0], c);
        });
        message.channel.send(embed);
    }

}
