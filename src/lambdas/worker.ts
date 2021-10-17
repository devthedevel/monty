import * as webhooks from '../services/webhook';
import { HttpResponse, Response } from "../utils/http";
import { Action, ActionType } from "../types/actions";
import { 
    BuyTicketsActionData,
    BuyTicketsActionHandler,
    CreateRaffleActionData, 
    CreateRaffleActionHandler,
    DeleteRaffleActionData,
    DeleteRaffleActionHandler 
} from "../handlers/actions";

/**
 * Handler for the worker lambda
 * @param action 
 * @returns 
 */
export const handler = async (action: Action): Promise<HttpResponse> => {
    console.log(`Incoming action with id: ${action.id}`);
    console.log(`Action type: ${ActionType[action.type]}`);

    switch(action.type) {
        case ActionType.COMMAND_CREATE: {
            return await CreateRaffleActionHandler(action as Action<CreateRaffleActionData>);
        }
        case ActionType.COMMAND_DELETE: {
            return await DeleteRaffleActionHandler(action as Action<DeleteRaffleActionData>);
        }
        case ActionType.MESSAGE_BUY_TICKETS: {
            return await BuyTicketsActionHandler(action as Action<BuyTicketsActionData>);
        }
        default: {
            await webhooks.editInitialResponse(action.context.applicationId, action.context.token, {
                content: `Whoops! Looks like something went wrong`,
                flags: 1 << 6
            });
        }
    }

    return Response(202);
}