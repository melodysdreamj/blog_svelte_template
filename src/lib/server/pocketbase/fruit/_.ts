import PocketBase from "pocketbase";
export class Fruit {
  constructor() {
    this.docId = Fruit.randomString(10);
  }
  definition: string = "";
  history: string = "";
  food: string = "";
  imageUrl: string = "";
  fileName: string = "";
  docId: string = "";
  toDataString(): string {
    return btoa(
      Array.from(
        new TextEncoder().encode(
          new URLSearchParams({
            definition: this.definition,
            history: this.history,
            food: this.food,
            imageUrl: this.imageUrl,
            fileName: this.fileName,
            docId: this.docId,
          }).toString()
        )
      )
        .map((byte) => String.fromCharCode(byte))
        .join("")
    );
  }
  static fromDataString(dataString: string): Fruit {
    const queryParams = Object.fromEntries(
      new URLSearchParams(atob(dataString))
    );
    const object = new Fruit();
    object.definition = queryParams["definition"] || "";
    object.history = queryParams["history"] || "";
    object.food = queryParams["food"] || "";
    object.imageUrl = queryParams["imageUrl"] || "";
    object.fileName = queryParams["fileName"] || "";
    object.docId = queryParams["docId"] || "";
    return object;
  }
  toMap(): object {
    return {
      definition: this.definition,
      history: this.history,
      food: this.food,
      imageUrl: this.imageUrl,
      fileName: this.fileName,
      docId: this.docId,
    };
  }
  static fromMap(queryParams: any): Fruit {
    const object = new Fruit();
    object.definition = queryParams.definition || "";
    object.history = queryParams.history || "";
    object.food = queryParams.food || "";
    object.imageUrl = queryParams.imageUrl || "";
    object.fileName = queryParams.fileName || "";
    object.docId = queryParams.docId;
    return object;
  }
  static randomString(length: number): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
}
export class FruitPocketBaseCollection {
  static async getDb(
    email: string,
    password: string,
    pocketHostAddress: string
  ) {
    const pb = new PocketBase(pocketHostAddress); // go to https://app.pockethost.io/
    await pb.admins.authWithPassword(email, password); // 어드민 로그인
    return pb;
  }
  static async get(
    docId: string,
    email: string,
    password: string,
    pocketHostAddress: string
  ): Promise<Fruit | null> {
    let pb: any = await FruitPocketBaseCollection.getDb(
      email,
      password,
      pocketHostAddress
    );
    try {
      const xs = await pb
        .collection("Fruit")
        .getFirstListItem(`docId="${docId}"`);
      return Fruit.fromMap(xs);
    } catch (e) {
      return null;
    }
  }
  static async getRow(
    docId: string,
    email: string,
    password: string,
    pocketHostAddress: string
  ): Promise<any> {
    let pb: any = await FruitPocketBaseCollection.getDb(
      email,
      password,
      pocketHostAddress
    );
    try {
      return await pb.collection("Fruit").getFirstListItem(`docId="${docId}"`);
    } catch (e) {
      return null;
    }
  }
}
