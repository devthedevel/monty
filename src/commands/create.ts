import { InteractionCallbackType, InteractionRequest, InteractionResponse } from "../discord/interactions";
import { HttpResponse, Response } from "../utils/http";
import { randomUuid } from "../utils/random";
import * as database from '../database';

export interface CreateCommandArgs {
    ticket_price: number;
}

export const CreateCommand = 'create';

export const CreateCommandHandler = async (request: InteractionRequest, args: CreateCommandArgs): Promise<HttpResponse> => {
    try {
        const id = randomUuid();

        console.log(`Creating raffle: ${id}`);

        await database.Raffle.create({
            GuildId: request.guild_id as string,
            Id: id,
            TicketPrice: args.ticket_price
        })

        return Response<InteractionResponse>(200, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: '@here',
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
                                value: String(args.ticket_price),
                                inline: true
                            }
                        ]
                    }
                ]
            }
        });
    } catch (error) {
        console.error(error);

        return Response<InteractionResponse>(200, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Oh no! Something went wrong! Don't worry its not your fault. Try again`,
                flags: 1 << 6
            }
        });
    }
}