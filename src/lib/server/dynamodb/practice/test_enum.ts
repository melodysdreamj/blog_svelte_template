export enum TestEnumTest {
    notSelected = 'notSelected',
    p000 = 'p000',
    p001 = 'p001',
}
export class TestEnumTestHelper {
    static fromString(enumString: string): TestEnumTest {
        const values = Object.values(TestEnumTest) as string[];
        if (values.includes(enumString)) {
            return enumString as TestEnumTest;
        }
        throw new Error(`Invalid enum value: ${enumString}`);
    }
}