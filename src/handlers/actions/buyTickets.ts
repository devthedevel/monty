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
        const totalTickets = await database.Raffle.addTickets({
            GuildId: action.context.guildId,
            Id: action.data.raffleId,
            UserId: action.data.userId,
            Tickets: action.data.tickets
        });

        console.log('Creating follow up message');
        await webhooks.createFollowupMessage(applicationId, token, {
            content: `You bought ${action.data.tickets} tickets, for a total of ${totalTickets}`,
            flags: 1 << 6
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
