import { Client, IntentsBitField, EmbedBuilder } from "discord.js";

interface InitOptions {
  client: Client;
  commandsDirectory?: string;
  eventsDirectory?: string;
}

declare function init(options: InitOptions): Promise<void>;

interface Embeds {
  InvalidPermissions: EmbedBuilder;
  MentionMissing: EmbedBuilder;
}

declare const embeds: Embeds;
declare const allIntents: IntentsBitField;

export { init, embeds, allIntents };
