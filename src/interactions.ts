export enum InteractionRequestType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3
}

export interface InteractionRequest {
    id: string;
    application_id: string;
    type: InteractionRequestType;
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