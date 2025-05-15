import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, UpdateItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Sub } from "./sub";
import { TestEnumTest, TestEnumTestHelper } from "./test_enum";
import { env } from '$env/dynamic/private';
export class Practice {
    constructor() {
        this.docId = Math.random().toString(36).substr(2, 10);
    }
    s000: string = "";
    i000: number = 0;
    b000: boolean = false;
    r000: number = 0.0;
    t000: Date = new Date(0);
    l000: string[] = [];
    m000: { [key: string]: any } = {};
    c000: Sub = new Sub();
    j000: Sub[] = [];
    e000: TestEnumTest = TestEnumTest.notSelected;
    docId: string = "";
    toDataString(): string {
        return btoa(Array.from(new TextEncoder().encode(new URLSearchParams({
            s000: this.s000,
            i000: this.i000.toString(),
            b000: this.b000.toString(),
            r000: this.r000.toString(),
            t000: this.t000.getTime().toString(),
            l000: JSON.stringify(this.l000),
            m000: JSON.stringify(this.m000),
            c000: this.c000.toDataString(),
            j000: JSON.stringify(this.j000.map((model: Sub) => model.toDataString())),
            e000: this.e000,
            docId: this.docId,
        }).toString())).map(byte => String.fromCharCode(byte)).join(""));
    }
    static fromDataString(dataString: string): Practice {
        const queryParams = Object.fromEntries(new URLSearchParams(atob(dataString)));
        const object = new Practice();
        object.s000 = queryParams["s000"] || "";
        object.i000 = parseInt(queryParams["i000"] || "0", 10);
        object.b000 = queryParams["b000"] === "true";
        object.r000 = parseFloat(queryParams["r000"] || "0");
        object.t000 = new Date(parseInt(queryParams["t000"] || "0", 10));
        object.l000 = JSON.parse(queryParams["l000"] || "[]");
        object.m000 = JSON.parse(queryParams["m000"] || "{}");
        object.c000 = Sub.fromDataString(queryParams["c000"] || new Sub().toDataString());
        object.j000 = (JSON.parse(queryParams["j000"] || "[]") || []).map((item: string) => Sub.fromDataString(item));
        object.e000 = TestEnumTestHelper.fromString(queryParams["e000"] || TestEnumTest.notSelected);
        object.docId = queryParams["docId"] || "";
        return object;
    }
    toMap(): object {
        return {
            s000: this.s000,
            i000: this.i000,
            b000: this.b000 ? 1 : 0,
            r000: this.r000,
            t000: this.t000.getTime(),
            l000: JSON.stringify(this.l000),
            m000: JSON.stringify(this.m000),
            c000: this.c000.toDataString(),
            j000: JSON.stringify(this.j000.map((model: Sub) => model.toDataString())),
            e000: this.e000,
            docId: this.docId,
        };
    }
    static fromMap(queryParams: any): Practice {
        const object = new Practice();
        object.s000 = queryParams.s000 || '';
        object.i000 = Number(queryParams.i000 || 0);
        object.b000 = queryParams.b000 === 1;
        object.r000 = queryParams.r000 || 0.0;
        object.t000 = new Date(queryParams.t000 || 0);
        object.l000 = JSON.parse(queryParams.l000 || '[]');
        object.m000 = JSON.parse(queryParams.m000 || '{}');
        object.c000 = Sub.fromDataString(queryParams.c000 || new Sub().toDataString());
        object.j000 = (JSON.parse(queryParams.j000 || '[]') || []).map((item: string) => Sub.fromDataString(item));
        object.e000 = TestEnumTestHelper.fromString(queryParams.e000 || TestEnumTest.notSelected);
        object.docId = queryParams.docId;
        return object;
    }
}
export class PracticeDynamoDb {
    private static client: DynamoDBClient;
    static readyDb(platform?: any) {
        if (this.client) {
            return this.client;
        }
        this.client = new DynamoDBClient({
            region: env.AWS_REGION || platform?.env?.AWS_REGION || '',
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID || platform?.env?.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY || platform?.env?.AWS_SECRET_ACCESS_KEY || '',
            },
        });
        console.log("AWS_REGION:", env.AWS_REGION || platform?.env?.AWS_REGION || '');
        console.log("AWS_ACCESS_KEY_ID:", env.AWS_ACCESS_KEY_ID || platform?.env?.AWS_ACCESS_KEY_ID || '');
        console.log("AWS_SECRET_ACCESS_KEY:", env.AWS_SECRET_ACCESS_KEY || platform?.env?.AWS_SECRET_ACCESS_KEY || '');
        return this.client;
    }
    static async createTable(platform?: any) {
        this.readyDb(platform);
        const tableParams = {
            TableName: "Practice",
            KeySchema: [
                { AttributeName: "docId", KeyType: "HASH" as const },
            ],
            AttributeDefinitions: [
                { AttributeName: "docId", AttributeType: "S" as ScalarAttributeType },
            ],
            BillingMode: "PAY_PER_REQUEST" as const,
        }
        try {
            const usersTable = await PracticeDynamoDb.client.send(new CreateTableCommand(tableParams));
            console.log("table created:", usersTable);
        } catch (err) {
            console.error("table creation failed:", err);
        }
    }
    static async upsert(object: Practice, platform?: any) {
        this.readyDb(platform);
        const upsertParams = {
            TableName: "Practice",
            Item: {
                docId: { S: object.docId },
                s000: { S: object.s000 },
                i000: { N: object.i000.toString() },
                b000: { N: (object.b000 ? 1 : 0).toString() },
                r000: { N: object.r000.toString() },
                t000: { N: object.t000.getTime().toString() },
                l000: { S: JSON.stringify(object.l000) },
                m000: { S: JSON.stringify(object.m000) },
                c000: { S: object.c000.toDataString() },
                j000: { S: JSON.stringify(object.j000.map((model: Sub) => model.toDataString())) },
                e000: { S: object.e000 },
            }
        };
        await PracticeDynamoDb.client.send(new PutItemCommand(upsertParams));
    }
    static async delete(docId: string, platform?: any): Promise<boolean> {
        this.readyDb(platform);
        try {
            const result = await PracticeDynamoDb.client.send(new DeleteItemCommand({
                TableName: "Practice",
                Key: { docId: { S: docId } },
                ReturnValues: "ALL_OLD"  // 삭제된 항목 반환
            }));
            return !!result.Attributes;  // 항목이 실제로 삭제되었는지 확인
        } catch (error) {
            console.error('Failed to delete item:', error);
            throw error;  // 또는 에러 처리 로직
        }
    }
    static async get(docId: string, platform?: any): Promise<Practice | null> {
        this.readyDb(platform);
        const getParams = {
            TableName: "Practice",
            Key: { docId: { S: docId } }
        };
        const result = await PracticeDynamoDb.client.send(new GetItemCommand(getParams));
        return this.fromMap(result.Item);
    }
    static fromMap(queryParams: any): Practice {
        const object = new Practice();
        object.s000 = queryParams.s000?.S ?? '';
        object.i000 = Number(queryParams.i000?.N ?? '0');
        object.b000 = Number(queryParams.b000?.N ?? '0') === 1;
        object.r000 = Number(queryParams.r000?.N ?? '0.0');
        object.t000 = new Date(Number(queryParams.t000?.N ?? '0'));
        object.l000 = JSON.parse(queryParams.l000?.S ?? '[]');
        object.m000 = JSON.parse(queryParams.m000?.S ?? '{}');
        object.c000 = Sub.fromDataString(queryParams.c000?.S ?? new Sub().toDataString());
        object.j000 = (JSON.parse(queryParams.j000?.S ?? '[]') || []).map((item: string) => Sub.fromDataString(item));
        object.e000 = TestEnumTestHelper.fromString(queryParams.e000?.S ?? TestEnumTest.notSelected);
        object.docId = queryParams.docId.S;
        return object;
    }
}