import { HttpResponse } from "../../utils/http";
import { Snowflake } from "../discord";

export interface Action<T = ActionData> {
    id: Snowflake;
    type: ActionType;
    context: ActionContext;
    data: T;
}

export enum ActionType {
    NULL,
    COMMAND_CREATE,
    COMMAND_DELETE
}

export interface ActionContext {
    applicationId: string;
    token: string;
    guildId: Snowflake;
}

export interface ActionData { }

export type ActionHandler<T = ActionData> = (action: Action<T>) => Promise<HttpResponse>;