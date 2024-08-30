import {FruitPocketBaseCollection} from "$lib/pocketbase/fruit/_";

export async function load(app : any) {

    const slug = app.params.slug;

    console.log(`slug: ${slug}`);

    let obj = await FruitPocketBaseCollection.getRow('docId','email','password','pocket host address');


    console.log('obj:', obj);

    return {obj:obj}

}

