type Snowflake = string;

export enum InteractionRequestType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3
}

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

export interface ApplicationCommandDataOption {
    name: string;
    type: ApplicationCommandOptionType;
    value?: any;
    options?: ApplicationCommandDataOption[];
}

export interface InteractionRequest {
    id: Snowflake;
    application_id: Snowflake;
    type: InteractionRequestType;
    token: string;
    version: number;
    data?: InteractionData;
    guild_id?: Snowflake;
    channel_id?: Snowflake;
    member?: { };
    user?: { };
    message?: { };
}

export interface InteractionData {
    id: Snowflake;
    name: string;
    type: ApplicationCommandType;
    resolved?: { };
    options?: ApplicationCommandDataOption[];
    custom_id?: string;
    component_type?: number;
    values?: { }[];
    target_id?: Snowflake;
}

export enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATED_MESSAGE = 7
}

export interface InteractionResponse {
    type: InteractionCallbackType;
    data?: any;
}