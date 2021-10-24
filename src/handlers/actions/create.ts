import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from "../../utils/http";
import { randomUuid } from "../../utils/random";
import { ActionData, ActionHandler } from "../../types/actions";
import { InteractionCallbackData } from '../../types/discord/interactions';

export interface CreateRaffleActionData extends ActionData {
    ticket_price: number;
    prize?: string;
}

export const CreateRaffleActionHandler: ActionHandler<CreateRaffleActionData> = async (action) => {
    const { applicationId, token, userId } = action.context;

    try {
        const id = randomUuid();

        console.log(`Creating raffle: ${id}`);

        await database.Raffle.create({
            GuildId: action.context.guildId,
            Id: id,
            TicketPrice: action.data.ticket_price,
            Prize: action.data.prize,
            CreatorId: userId
        });

        console.log('Updating initial response');
        await webhooks.editInitialResponse(applicationId, token, buildResponseMessage(id, userId, action.data));

        return Response(200);
    } catch (error) {
        console.error(error);

        await webhooks.editInitialResponse(applicationId, token, {
            content: `Oh no! Something went wrong! Don't worry its not your fault. Try again`
        })

        return Response(500);
    }
}

function buildResponseMessage(id: string, userId: string, data: CreateRaffleActionData): InteractionCallbackData {
    const fields = [
        {
            name: 'ID',
            value: id,
            inline: true
        },
        {
            name: 'Ticket Price',
            value: String(data.ticket_price),
            inline: true
        },
        {
            name: 'Prize',
            value: data.prize ?? '50% of ticket sales',
            inline: true
        }
    ];
    
    return {
        content: '@here',
        embeds: [
            {
                color: 0xd733ff,
                title: 'New Raffle',
                description: `Hey folks! <@${userId}> has created a new raffle! Ask a consul on how to buy tickets!`,
                fields: fields
            }
        ]
    }
}