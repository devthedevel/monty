import { InteractionRequestType } from "./interactions";

export interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: { };
    image?: { };
    thumbnail?: { };
    video?: { };
    provider?: { };
    author?: EmbedAuthor;
    fields?: EmbedField[];
}

export interface EmbedAuthor {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface GuildMember {
    user?: User;
    nick?: string;
    roles: Snowflake[];
    joined_at?: string;
    premium_since?: string;
    deaf: boolean;
    mute: boolean;
    pending?: boolean;
    permissions?: string;
}

export interface Message {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author: User;
    member?: Partial<GuildMember>;
    content: string;
    timestamp: string;
    edited_timestamp: string;
    tts: boolean;
    mention_everyone: boolean;
    mentions: User[];
    mention_roles: Snowflake[];
    mention_channels?: { }[];
    attachments: { }[];
    embeds: Embed[];
    reactions?: { }[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: number;
    activity?: { };
    application?: { };
    application_id?: Snowflake;
    message_reference?: { };
    flags?: number;
    referenced_message?: { };
    interaction?: MessageInteraction;
    thread?: { };
    components?: { }[];
    sticker_items?: { }[];
    stickers?: { }[];
}

export interface MessageInteraction {
    id: Snowflake;
    type: InteractionRequestType;
    name: string;
    user: User;
}

export interface ResolvedData {
    users?: {
        // Snowflake
        [id: string]: User;
    };
    members?: {
        // Snowflake
        [id: string]: GuildMember;
    }
    roles?: {
        // Snowflake
        [id: string]: { };
    }
    channels?: {
        // Snowflake
        [id: string]: { };
    }
    messages?: {
        // Snowflake
        [id: string]: Message;
    }
}

export type Snowflake = string;

export interface User {
    id: Snowflake;
    username: string;
    discriminator: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
}