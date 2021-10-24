import { AWSError, DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

interface RaffleTableKey {
    GuildId: string;
    Id: string;
}

interface RaffleCreateItem {
    CreatorId: string;
    TicketPrice: number;
    Prize?: string;
}
type RaffleCreateParams = RaffleTableKey & RaffleCreateItem;

type RaffleItem = RaffleCreateParams & Omit<RaffleAddTicketsParams, 'UserId'>;
interface RaffleAddTicketsItem {
    UserId: string;
    Tickets: number;
}
type RaffleAddTicketsParams = RaffleTableKey & RaffleAddTicketsItem;

interface RaffleUpdateWinnerItem {
    Winner: string;
}
type RaffleUpdateWinnerParams = RaffleTableKey & RaffleUpdateWinnerItem;

const db = new DynamoDB.DocumentClient();

export class Raffle {
    private static TableName = 'Raffles';

    static async create(raffle: RaffleCreateParams): Promise<void> {
        const params: DocumentClient.PutItemInput = {
            TableName: Raffle.TableName,
            Item: {
                ...raffle,
                CreatedDate: new Date().valueOf(),
                Tickets: { }
            }
        };

        await db.put(params).promise();
    }

    static async delete(raffle: RaffleTableKey): Promise<void> {
        const params: DocumentClient.DeleteItemInput = {
            TableName: Raffle.TableName,
            Key: raffle
        }

        await db.delete(params).promise();
    }

    static async addTickets(params: RaffleAddTicketsParams): Promise<number> {
        const _params: DocumentClient.UpdateItemInput = {
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
                ..._params,
                UpdateExpression: 'set #t.#u = #t.#u + :v',
                ConditionExpression: 'attribute_exists(#t.#u)'
            }).promise()).Attributes!.Tickets[params.UserId];
        } catch (error) {
            if ((error as AWSError).code === 'ConditionalCheckFailedException') {
                return (await db.update({
                    ..._params,
                    UpdateExpression: 'set #t.#u = :v'
                }).promise()).Attributes!.Tickets[params.UserId];
            }

            throw new Error('Failed to write to database');
        }
    }

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

    static async get(params: RaffleTableKey): Promise<RaffleItem | undefined> {
        const _params: DocumentClient.GetItemInput = {
            TableName: Raffle.TableName,
            Key: params
        }

        return (await db.get(_params).promise()).Item as RaffleItem | undefined;
    }

    static async updateWinner(params: RaffleUpdateWinnerParams): Promise<any> {
        const _params: DocumentClient.UpdateItemInput = {
            TableName: Raffle.TableName,
            Key: {
                GuildId: params.GuildId,
                Id: params.Id
            },
            UpdateExpression: 'set #w = :id',
            ExpressionAttributeNames: {
                '#w': 'Winner'
            },
            ExpressionAttributeValues: {
                ':id': params.Winner
            }
        }

        return db.update(_params).promise();
    }
}