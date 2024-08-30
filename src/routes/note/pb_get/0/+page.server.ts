import {ExamplePocketBaseCollection} from "$lib/pocketbase/exmaple/_";

export async function load(app : any) {

    // const slug = app.params.slug;
    //
    // console.log(`slug: ${slug}`)

    let example = await ExamplePocketBaseCollection.getRow('docId','email','password','pocket host address');

    return {obj:example}

}

