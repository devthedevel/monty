import { ResolvedData, Snowflake } from ".";

export enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10
}

export interface ApplicationCommandData {
    id: Snowflake;
    name: string;
    type: ApplicationCommandType;
    resolved?: ResolvedData;
    options?: ApplicationCommandDataOption[];
}

export interface ApplicationCommandDataOption {
    name: string;
    type: ApplicationCommandOptionType;
    value?: any;
    options?: ApplicationCommandDataOption[];
}