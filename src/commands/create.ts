import { InteractionCallbackType, InteractionResponse } from "../discord/interactions";
import { HttpResponse, Response } from "../utils/http";
import { randomUuid } from "../utils/random";

export interface CreateCommandArgs {
    name: string;
    ticket_price: number;
}

export const CreateCommand = async (args: CreateCommandArgs): Promise<HttpResponse> => {
    const id = randomUuid();

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
                            inline: false
                        },
                        {
                            name: 'Name',
                            value: args.name,
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
}