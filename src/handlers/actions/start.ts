import { ActionData, ActionHandler } from '../../types/actions';
import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from '../../utils/http';
import { randomElement } from '../../utils/random';

export interface StartRaffleActionData extends ActionData {
    id: string;
}

export const StartRaffleActionHandler: ActionHandler<StartRaffleActionData> = async (action) => {
    const { applicationId, token, guildId } = action.context;
    
    try {
        const { id } = action.data;

        console.log(`Running raffle '${id}'`);

        const raffle = await database.Raffle.get({
            GuildId: guildId,
            Id: id
        });

        if (!raffle) {
            console.log(`Could not find raffle with id '${id}'`);
            await webhooks.createFollowupMessage(applicationId, token, {
                content: `Could not find raffle with id '${id}'`,
                flags: 1 << 6
            });
            return Response(200);
        }

        const tickets: string[] = [];

        // Push a user id x amount of times to an array
        Object.keys(raffle.Tickets).forEach(userId => {
            const numTickets = raffle.Tickets[userId];
            for (let i = 0; i < numTickets; i++) {
                tickets.push(userId);
            }
        });

        console.log(JSON.stringify(tickets));

        const totalTicketSales = tickets.length * raffle.TicketPrice;

        const [winnerId, _] = randomElement(tickets);
        
        console.log(`User '${winnerId}' has won`);
        await database.Raffle.updateWinner({
            GuildId: guildId,
            Id: id,
            WinnerId: winnerId
        })

        console.log('Creating follow up message');
        await webhooks.createFollowupMessage(applicationId, token, {
            content: `@here`,
            embeds: [
                {
                    color: 0xd733ff,
                    title: 'Raffle Winner',
                    description: `Congratulations to <@${winnerId}> for winning this raffle!`,
                    fields: [
                        {
                            name: 'Id',
                            value: id,
                            inline: true
                        },
                        {
                            name: 'Prize',
                            value: raffle.Prize ?? `50% of ${totalTicketSales} = ${Math.round(totalTicketSales / 2)}`,
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
