import * as database from '../../services/database';
import * as webhooks from '../../services/webhook';
import { Response } from "../../utils/http";
import { ActionData, ActionHandler } from "../../types/actions";

export interface DeleteRaffleActionData extends ActionData {
    id: string;
}

export const DeleteRaffleActionHandler: ActionHandler<DeleteRaffleActionData> = async (action) => {
    const { applicationId, token } = action.context;

    try {
        const raffleId = action.data.id;
        console.log(`Deleting raffle: ${raffleId}`);

        await database.Raffle.delete({
            GuildId: action.context.guildId,
            Id: raffleId
        });

        console.log('Updating initial response');
        await webhooks.editInitialResponse(applicationId, token, {
            content: `Raffle '${raffleId}' deleted!`,
            flags: 1 << 6
        });

        return Response(200);
    } catch (error) {
        console.error(error);

        await webhooks.editInitialResponse(applicationId, token, {
            content: `Oh no! Something went wrong! Don't worry its not your fault. Try again`,
        })

        return Response(500);
    }
}