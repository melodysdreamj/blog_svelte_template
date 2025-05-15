import {TestEnumTest, TestEnumTestHelper} from "$lib/pocketbase/exmaple/test_enum";
import {Sub2} from "$lib/pocketbase/exmaple/sub2";
export class Sub {
	constructor() {
		this.docId = Sub.randomString(10);
	}
	s000: string = "";
	i000: number = 0;
	b000: boolean = false;
	r000: number = 0.0;
	t000: Date = new Date(0);
	l000: string[] = [];
	m000: { [key: string]: any } = {};
	c000: Sub2 = new Sub2();
	j000 : Sub2[] = [];
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
			j000: JSON.stringify(this.j000.map((model: Sub2) => model.toDataString())),
			e000: this.e000,
			docId: this.docId,
		}).toString())).map(byte => String.fromCharCode(byte)).join(""));
	}
	static fromDataString(dataString: string): Sub {
		const queryParams = Object.fromEntries(new URLSearchParams(atob(dataString)));
		const object = new Sub();
		object.s000 = queryParams["s000"] || "";
		object.i000 = parseInt(queryParams["i000"] || "0", 10);
		object.b000 = queryParams["b000"] === "true";
		object.r000 = parseFloat(queryParams["r000"] || "0");
		object.t000 = new Date(parseInt(queryParams["t000"] || "0", 10));
		object.l000 = JSON.parse(queryParams["l000"] || "[]");
		object.m000 = JSON.parse(queryParams["m000"] || "{}");
		object.c000 = Sub2.fromDataString(queryParams["c000"] || new Sub2().toDataString());
		object.j000 = (JSON.parse(queryParams["j000"] || "[]") || []).map((item: string) => Sub2.fromDataString(item));
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
			j000: JSON.stringify(this.j000.map((model: Sub2) => model.toDataString())),
			e000: this.e000,
			docId: this.docId,
		};
	}
	static fromMap(queryParams: any): Sub {
		const object = new Sub();
		object.s000 = queryParams.s000 || '';
		object.i000 = Number(queryParams.i000 || 0);
		object.b000 = queryParams.b000 === 1;
		object.r000 = queryParams.r000 || 0.0;
		object.t000 = new Date(queryParams.t000 || 0);
		object.l000 = JSON.parse(queryParams.l000 || '[]');
		object.m000 = JSON.parse(queryParams.m000 || '{}');
		object.c000 = Sub2.fromDataString(queryParams.c000 || new Sub2().toDataString());
		object.j000 = (JSON.parse(queryParams.j000 || '[]') || []).map((item: string) => Sub2.fromDataString(item));
		object.e000 = TestEnumTestHelper.fromString(queryParams.e000 || TestEnumTest.notSelected);
		object.docId = queryParams.docId;
		return object;
	}
	static randomString(length: number): string {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}
}