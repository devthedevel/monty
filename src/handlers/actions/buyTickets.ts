import { ActionData, ActionHandler } from "../../types/actions";
import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from "../../utils/http";

export interface BuyTicketsActionData extends ActionData {
    raffleId: string;
    userId: string;
    tickets: number;
}

export const BuyTicketsActionHandler: ActionHandler<BuyTicketsActionData> = async (action) => {
    const { applicationId, token } = action.context;
    
    try {
        await database.Raffle.addTickets({
            GuildId: action.context.guildId,
            Id: action.data.raffleId,
            UserId: action.data.userId,
            Tickets: action.data.tickets
        });

        console.log('Updating initial response');
        await webhooks.editInitialResponse(applicationId, token, {
            content: `You bought ${action.data.tickets} tickets`
        });

        return Response(200);
    } catch (error) {
        console.error(error);

        await webhooks.editInitialResponse(applicationId, token, {
            content: `Oh no! Something went wrong! Don't worry its not your fault. Try again`
        })

        return Response(500);
    }
}
