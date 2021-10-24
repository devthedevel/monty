import { AWSError, DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

interface RaffleTableKey {
    GuildId: string;
    Id: string;
}

interface RaffleData {
    CreatorId: string;
    CreatedDate: number;
    Tickets: {
        [userId: string]: number;
    };
    TicketPrice: number;
    Prize?: string;
    StartDate?: number;
    WinnerId?: string;
}

type RaffleItem = RaffleTableKey & RaffleData;

type CreateRaffleParams = RaffleTableKey & Pick<RaffleData, 'CreatorId' | 'TicketPrice' | 'Prize'>;

type AddTicketsParams = RaffleTableKey & {UserId: string; Tickets: number};

type UpdateWinnerParams = RaffleTableKey & Pick<RaffleData, 'WinnerId'>;


const db = new DynamoDB.DocumentClient();

export class Raffle {
    private static TableName = 'Raffles';

    /**
     * Creates a new raffle
     * @param params 
     */
    static async create(params: CreateRaffleParams): Promise<void> {
        const putParams: DocumentClient.PutItemInput = {
            TableName: Raffle.TableName,
            Item: {
                ...params,
                CreatedDate: new Date().valueOf(),
                Tickets: { }
            }
        };

        await db.put(putParams).promise();
    }

    /**
     * Deletes an existing raffle
     * @param params 
     */
    static async delete(params: RaffleTableKey): Promise<void> {
        const deleteParams: DocumentClient.DeleteItemInput = {
            TableName: Raffle.TableName,
            Key: params
        }

        await db.delete(deleteParams).promise();
    }

    /**
     * Adds tickets to the specific user
     * @param params 
     * @returns The total amount of tickets that the user has (post update)
     */
    static async addTickets(params: AddTicketsParams): Promise<number> {
        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: Raffle.TableName,
            Key: {
                GuildId: params.GuildId,
                Id: params.Id
            },
            ExpressionAttributeNames: {
                '#t': 'Tickets',
                '#u': params.UserId
            },
            ExpressionAttributeValues: {
                ':v': params.Tickets
            },
            ReturnValues: "UPDATED_NEW"
        }

        try {
            return (await db.update({
                ...updateParams,
                UpdateExpression: 'set #t.#u = #t.#u + :v',
                ConditionExpression: 'attribute_exists(#t.#u)'
            }).promise()).Attributes!.Tickets[params.UserId];
        } catch (error) {
            if ((error as AWSError).code === 'ConditionalCheckFailedException') {
                return (await db.update({
                    ...updateParams,
                    UpdateExpression: 'set #t.#u = :v'
                }).promise()).Attributes!.Tickets[params.UserId];
            }

            throw new Error('Failed to write to database');
        }
    }

    /**
     * Gets a list of raffles for a specific guild
     * @param guildId 
     * @returns List of raffle items
     */
    static async getRaffles(guildId: RaffleTableKey['GuildId']): Promise<RaffleItem[]> {
        const params: DocumentClient.QueryInput = {
            TableName: Raffle.TableName,
            KeyConditionExpression: '#pk = :gid',
            ExpressionAttributeNames: {
                '#pk': 'GuildId'
            },
            ExpressionAttributeValues: {
                ':gid': guildId
            }
        }

        return (await db.query(params).promise()).Items as RaffleItem[];
    }

    /**
     * Gets a single raffle if it exists
     * @param params 
     * @returns Raffle item or undefined if raffle does not exist
     */
    static async get(params: RaffleTableKey): Promise<RaffleItem | undefined> {
        const getParams: DocumentClient.GetItemInput = {
            TableName: Raffle.TableName,
            Key: params
        }

        return (await db.get(getParams).promise()).Item as RaffleItem | undefined;
    }

    /**
     * Updates the raffle with the winner
     * @param params 
     * @returns 
     */
    static async updateWinner(params: UpdateWinnerParams): Promise<any> {
        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: Raffle.TableName,
            Key: {
                GuildId: params.GuildId,
                Id: params.Id
            },
            UpdateExpression: 'set #w = :id, #sd = :sdVal',
            ExpressionAttributeNames: {
                '#w': 'Winner',
                '#sd': 'StartDate'
            },
            ExpressionAttributeValues: {
                ':id': params.WinnerId,
                ':sdVal': new Date().valueOf()
            },
            ReturnValues: 'NONE'
        }

        return db.update(updateParams).promise();
    }
}