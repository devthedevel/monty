import { ActionData, ActionHandler } from "../../types/actions";
import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from "../../utils/http";

export interface AddTicketsActionData extends ActionData {
    raffle_id: string;
    user: string;
    tickets: number;
}

export const AddTicketsActionHandler: ActionHandler<AddTicketsActionData> = async (action) => {
    const { applicationId, token } = action.context;
    
    try {
        const totalTickets = await database.Raffle.addTickets({
            GuildId: action.context.guildId,
            Id: action.data.raffle_id.toUpperCase(),
            UserId: action.data.user,
            Tickets: action.data.tickets
        });

        console.log('Creating follow up message');
        await webhooks.createFollowupMessage(applicationId, token, {
            content: `You added ${action.data.tickets} tickets to <@${action.data.user}> for a total of ${totalTickets} tickets`,
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
