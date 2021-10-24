import * as webhooks from '../services/webhook';
import { HttpResponse, Response } from "../utils/http";
import { Action, ActionType } from "../types/actions";
import { 
    AddTicketsActionData,
    AddTicketsActionHandler,
    CreateRaffleActionData, 
    CreateRaffleActionHandler,
    DeleteRaffleActionData,
    DeleteRaffleActionHandler,
    StartRaffleActionData,
    StartRaffleActionHandler,
} from "../handlers/actions";

/**
 * Handler for the worker lambda
 * @param action 
 * @returns 
 */
export const handler = async (action: Action): Promise<HttpResponse> => {
    console.log(`Incoming action with id: ${action.id}`);
    console.log(`Action type: ${ActionType[action.type]}`);

    try {
        switch(action.type) {
            case ActionType.COMMAND_CREATE: {
                return await CreateRaffleActionHandler(action as Action<CreateRaffleActionData>);
            }
            case ActionType.COMMAND_DELETE: {
                return await DeleteRaffleActionHandler(action as Action<DeleteRaffleActionData>);
            }
            case ActionType.COMMAND_ADD_TICKETS: {
                return await AddTicketsActionHandler(action as Action<AddTicketsActionData>);
            }
            case ActionType.COMMAND_START: {
                return await StartRaffleActionHandler(action as Action<StartRaffleActionData>);
            }
            default: {
                await webhooks.editInitialResponse(action.context.applicationId, action.context.token, {
                    content: `Whoops! Looks like something went wrong`,
                    flags: 1 << 6
                });
            }
        }
    
        return Response(202);
    } catch(error) {
        console.error(error);
        return Response(500);
    }
}