
export async function load(app : any) {

    const slug = app.params.slug;

    console.log(`slug: ${slug}`)

    return {slug:slug}

}

