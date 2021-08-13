import { Embed, GuildMember, Message, Snowflake, User } from '.';
import { ApplicationCommandType, ApplicationCommandDataOption } from './applicationCommand';

export enum InteractionRequestType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3
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
    member?: GuildMember;
    user?: User;
    message?: Message;
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
    data?: InteractionCallbackData;
}

export interface InteractionCallbackData {
    tts?: boolean;
    content?: string;
    embeds?: Embed[];
    allowed_mentions?: { };
    flags?: number;
    components?: { }[];
}