import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, UpdateItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { env } from '$env/dynamic/private';

export class New {

    constructor() {
        this.docId = Math.random().toString(36).substr(2, 10);
    }

    // s000: string = "";
    // i000: number = 0;
    // b000: boolean = false;
    // r000: number = 0.0;
    // t000: Date = new Date(0);
    // l000: string[] = [];
    // m000: { [key: string]: any } = {};
    // c000: OtherModel = new OtherModel();
    // j000 : OtherModel[] = [];
    // e000: SomeEnum = SomeEnum.notSelected;

    docId: string = "";

    toDataString(): string {
        return btoa(Array.from(new TextEncoder().encode(new URLSearchParams({
            // s000: this.s000,
            // i000: this.i000.toString(),
            // b000: this.b000.toString(),
            // r000: this.r000.toString(),
            // t000: this.t000.getTime().toString(),
            // l000: JSON.stringify(this.l000),
            // m000: JSON.stringify(this.m000),
            // c000: this.c000.toDataString(),
            // j000: JSON.stringify(this.j000.map((model: OtherModel) => model.toDataString())),
            // e000: this.e000,
            docId: this.docId,
        }).toString())).map(byte => String.fromCharCode(byte)).join(""));
    }

    static fromDataString(dataString: string): New {
        const queryParams = Object.fromEntries(new URLSearchParams(atob(dataString)));

        const object = new New();

        // object.s000 = queryParams["s000"] || "";
        // object.i000 = parseInt(queryParams["i000"] || "0", 10);
        // object.b000 = queryParams["b000"] === "true";
        // object.r000 = parseFloat(queryParams["r000"] || "0");
        // object.t000 = new Date(parseInt(queryParams["t000"] || "0", 10));
        // object.l000 = JSON.parse(queryParams["l000"] || "[]");
        // object.m000 = JSON.parse(queryParams["m000"] || "{}");
        // object.c000 = OtherModel.fromDataString(queryParams["c000"] || new OtherModel().toDataString());
        // object.j000 = (JSON.parse(queryParams["j000"] || "[]") || []).map((item: string) => OtherModel.fromDataString(item));
        // object.e000 = SomeEnumHelper.fromString(queryParams["e000"] || SomeEnum.notSelected);
        object.docId = queryParams["docId"] || "";

        return object;
    }

    toMap(): object {
        return {
            // s000: this.s000,
            // i000: this.i000,
            // b000: this.b000 ? 1 : 0,
            // r000: this.r000,
            // t000: this.t000.getTime(),
            // l000: JSON.stringify(this.l000),
            // m000: JSON.stringify(this.m000),
            // c000: this.c000.toDataString(),
            // j000: JSON.stringify(this.j000.map((model: OtherModel) => model.toDataString())),
            // e000: this.e000,
            docId: this.docId,
        };
    }

    static fromMap(queryParams: any): New {
        const object = new New();

        // object.s000 = queryParams.s000 || '';
        // object.i000 = Number(queryParams.i000 || 0);
        // object.b000 = queryParams.b000 === 1;
        // object.r000 = queryParams.r000 || 0.0;
        // object.t000 = new Date(queryParams.t000 || 0);
        // object.l000 = JSON.parse(queryParams.l000 || '[]');
        // object.m000 = JSON.parse(queryParams.m000 || '{}');
        // object.c000 = OtherModel.fromDataString(queryParams.c000 || new OtherModel().toDataString());
        // object.j000 = (JSON.parse(queryParams.j000 || '[]') || []).map((item: string) => OtherModel.fromDataString(item));
        // object.e000 = SomeEnumHelper.fromString(queryParams.e000 || SomeEnum.notSelected);
        object.docId = queryParams.docId;

        return object;
    }
}

export class NewDynamoDb {

    private static client: DynamoDBClient;

    static readyDb(platform?: any) {
        if (this.client) {
            return this.client;
        }
        this.client = new DynamoDBClient({
            region: env.AWS_REGION || platform?.env?.AWS_REGION || 'ap-northeast-2',
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID || platform?.env?.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY || platform?.env?.AWS_SECRET_ACCESS_KEY || '',
            },
        });
        return this.client;
    }

    static async createTable(platform?: any) {
        const tableParams = {
            TableName: "New",
            KeySchema: [
                { AttributeName: "docId", KeyType: "HASH" as const },
            ],
            AttributeDefinitions: [
                { AttributeName: "docId", AttributeType: "S" as ScalarAttributeType },
            ],
            BillingMode: "PAY_PER_REQUEST" as const,
        }

        try {
            const usersTable = await NewDynamoDb.client.send(new CreateTableCommand(tableParams));
            console.log("table created:", usersTable);
        } catch (err) {
            console.error("table creation failed:", err);
        }
    }

    static async upsert(object: New, platform?: any) {
        this.readyDb(platform);

        const upsertParams = {
            TableName: "New",
            Item: {
                docId: { S: object.docId },
                // s000: { S: object.s000 },
                // i000: { N: object.i000.toString() },
                // b000: { N: (object.b000 ? 1 : 0).toString() },
                // r000: { N: object.r000.toString() },
                // t000: { N: object.t000.getTime().toString() },
                // l000: { S: JSON.stringify(object.l000) },
                // m000: { S: JSON.stringify(object.m000) },
                // c000: { S: object.c000.toDataString() },
                // j000: { S: JSON.stringify(object.j000.map((model: OtherModel) => model.toDataString())) },
                // e000: { S: object.e000 },
            }
        };

        await NewDynamoDb.client.send(new PutItemCommand(upsertParams));
    }

    static async delete(docId: string, platform?: any): Promise<boolean> {
        this.readyDb(platform);

        try {
            const result = await NewDynamoDb.client.send(new DeleteItemCommand({
                TableName: "New",
                Key: { docId: { S: docId } },
                ReturnValues: "ALL_OLD"  // 삭제된 항목 반환
            }));
            return !!result.Attributes;  // 항목이 실제로 삭제되었는지 확인
        } catch (error) {
            console.error('Failed to delete item:', error);
            throw error;  // 또는 에러 처리 로직
        }
    }

    static async get(docId: string, platform?: any): Promise<New | null> {
        this.readyDb(platform);
        const getParams = {
            TableName: "New",
            Key: { docId: { S: docId } }
        };

        const result = await NewDynamoDb.client.send(new GetItemCommand(getParams));
        if (result.Item) {
            return this.fromMap(result.Item);
        }
        return null;
    }

    static fromMap(queryParams: any): New {
        const object = new New();

        // object.s000 = queryParams.s000?.S ?? '';
        // object.i000 = Number(queryParams.i000?.N ?? '0');
        // object.b000 = Number(queryParams.b000?.N ?? '0') === 1;
        // object.r000 = Number(queryParams.r000?.N ?? '0.0');
        // object.t000 = new Date(Number(queryParams.t000?.N ?? '0'));
        // object.l000 = JSON.parse(queryParams.l000?.S ?? '[]');
        // object.m000 = JSON.parse(queryParams.m000?.S ?? '{}');
        // object.c000 = OtherModel.fromDataString(queryParams.c000?.S ?? new OtherModel().toDataString());
        // object.j000 = (JSON.parse(queryParams.j000?.S ?? '[]') || []).map((item: string) => OtherModel.fromDataString(item));
        // object.e000 = SomeEnumHelper.fromString(queryParams.e000?.S ?? SomeEnum.notSelected);
        object.docId = queryParams.docId.S;

        return object;
    }
}