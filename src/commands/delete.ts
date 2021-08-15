import { InteractionCallbackType, InteractionRequest, InteractionResponse } from "../discord/interactions";
import { HttpResponse, Response } from "../utils/http";
import * as database from '../database';

export interface DeleteCommandArgs {
    id: string;
}

export const DeleteCommand = 'delete';

export const DeleteCommandHandler = async (request: InteractionRequest, args: DeleteCommandArgs): Promise<HttpResponse> => {
    try {
        console.log(`Deleting raffle: ${args.id}`);

        await database.Raffle.delete({
            GuildId: request.guild_id as string,
            Id: args.id
        })

        return Response<InteractionResponse>(200, {
            type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Raffle '${args.id}' deleted!`,
                flags: 1 << 6
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