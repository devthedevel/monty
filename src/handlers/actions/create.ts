import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from "../../utils/http";
import { randomUuid } from "../../utils/random";
import { ActionData, ActionHandler } from "../../types/actions";

export interface CreateRaffleActionData extends ActionData {
    ticket_price: number;
}

export const CreateRaffleActionHandler: ActionHandler<CreateRaffleActionData> = async (action) => {
    const { applicationId, token } = action.context;

    try {
        const id = randomUuid();

        console.log(`Creating raffle: ${id}`);

        await database.Raffle.create({
            GuildId: action.context.guildId,
            Id: id,
            TicketPrice: action.data.ticket_price
        })

        console.log('Updating initial response');
        await webhooks.editInitialResponse(applicationId, token, {
            content: '@here deferred',
            embeds: [
                {
                    color: 0xd733ff,
                    title: 'New Raffle',
                    description: `Hey folks! Theres a new raffle created! To join right click this message > apps > join`,
                    fields: [
                        {
                            name: 'ID',
                            value: id,
                            inline: true
                        },
                        {
                            name: 'Ticket Price',
                            value: String(action.data.ticket_price),
                            inline: true
                        }
                    ]
                }
            ]
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