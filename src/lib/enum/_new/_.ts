export enum NewEnum {
	notSelected = 'notSelected',
	p000 = 'p000',
	p001 = 'p001',
	// p002 = 'p002',
	// p003 = 'p003',
	// p004 = 'p004',
	// p005 = 'p005',
	// p006 = 'p006',
	// p007 = 'p007',
	// p008 = 'p008',
	// p009 = 'p009',
	// p010 = 'p010',
	// p011 = 'p011',
	// p012 = 'p012',
	// p013 = 'p013',
	// p014 = 'p014',
	// p015 = 'p015',
	// p016 = 'p016',
	// p017 = 'p017',
	// p018 = 'p018',
	// p019 = 'p019',
	// p020 = 'p020',
}

export class NewEnumHelper {
	static fromString(enumString: string): NewEnum {
		const values = Object.values(NewEnum) as string[];
		if (values.includes(enumString)) {
			return enumString as NewEnum;
		}
		throw new Error(`Invalid enum value: ${enumString}`);
	}
}