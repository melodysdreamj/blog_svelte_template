<script>

    export let data

    const fruitObj = data.obj
</script>

<header class="w-full container mx-auto">
    <head>
        <title>10 Reasons Why Luther College is the Best Choice in Louisiana</title>
        <meta
                name="description"
                content="기계가 웹페이지를 효과적으로 이해할 수 있도록 사용하는 메타 태그에 대해서 알아보겠습니다."
        />
        <meta name="keywords" content="HTML, CSS, JavaScript"/>
        <meta name="author" content="Dale Seo"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta charset="UTF-8"/>

        <meta name="og:site_name" content="달레의 블로그"/>
        <meta name="og:title" content="Lorem Ipsum Dolor Sit Amet Dolor Sit Amet"/>
        <meta
                name="og:description"
                content="기계가 웹페이지를 효과적으로 이해할 수 있도록 사용하는 메타 태그에 대해서 알아보겠습니다."
        />
        <meta name="og:image"
              content="https://imagedelivery.net/skoY81WR0K7iTjQzfY4e1g/deb3b7c7-622b-4086-688b-0bfe246d1000/public"/>
        <meta name="og:url" content="https://google.com"/>
        <meta name="og:type" content="website"/>
    </head>
</header>

<div class="flex justify-center items-center pt-6 pb-1">
    <img class="h-11" src="https://cdn-icons-png.flaticon.com/512/4181/4181634.png"
         alt="Your Company">
</div>


<div class="relative overflow-hidden bg-white py-1">
    <div class="hidden lg:absolute lg:inset-y-0 lg:block lg:h-full lg:w-full lg:[overflow-anchor:none]">
        <div class="relative mx-auto h-full max-w-prose text-lg" aria-hidden="true">
            <svg class="absolute top-12 left-full translate-x-32 transform" width="404" height="384" fill="none"
                 viewBox="0 0 404 384">
                <defs>
                    <pattern id="74b3fd99-0a6f-4271-bef2-e80eeafdf357" x="0" y="0" width="20" height="20"
                             patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" class="text-gray-200" fill="currentColor"/>
                    </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)"/>
            </svg>
            <svg class="absolute top-1/2 right-full -translate-y-1/2 -translate-x-32 transform" width="404" height="384"
                 fill="none" viewBox="0 0 404 384">
                <defs>
                    <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20"
                             patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" class="text-gray-200" fill="currentColor"/>
                    </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"/>
            </svg>
            <svg class="absolute bottom-12 left-full translate-x-32 transform" width="404" height="384" fill="none"
                 viewBox="0 0 404 384">
                <defs>
                    <pattern id="d3eb07ae-5182-43e6-857d-35c643af9034" x="0" y="0" width="20" height="20"
                             patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" class="text-gray-200" fill="currentColor"/>
                    </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"/>
            </svg>
        </div>
    </div>
    <div class="relative px-4 lg:px-8">
        <div class="mx-auto max-w-prose text-lg">
            <h1>
                <!--                <span class="block text-center text-lg font-semibold text-indigo-600">Introducing</span>-->
                <span class="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
{fruitObj.docId}</span>
            </h1>


            <div class="text-center pt-2">
                <p class="text-sm dark:text-gray-400">by
                    <span class="underline dark:text-violet-400 font-semibold" itemprop="name ">June</span>
                    <time datetime="2021-02-12 15:34:18-0200">Feb 12th 2021</time>
                </p>
            </div>


            <br/>

            <div class="h-auto max-w-full">
                <a href="https://google.com" class="hover:opacity-75">

                    <img src="{fruitObj.imageUrl}"
                         width="1366" height="768" alt="hihi heres tag"/>
                </a>
            </div>
        </div>


        <div class="prose prose-lg prose-indigo mx-auto mt-10 text-gray-500">
            <h2 class="text-xl">1. 정의</h2>

            <p>{fruitObj.definition}</p>


            <h2 class="text-2xl">2.역사</h2>

            <p>{fruitObj.history}</p>

            <h2 class="text-2xl">3.요리들</h2>

            <p>{fruitObj.food}</p>

        </div>


    </div>

</div>


<footer class="bg-transparent">
    <div class="mx-auto max-w-7xl overflow-hidden pb-8 pt-0.5 px-4 sm:py-12 lg:px-8">
        <div class="border-t border-gray-900/10">
            <p class="mt-5 text-center text-sm leading-5 text-gray-500">&copy; Made by June, Powered by SkyPastel</p>
        </div>

    </div>
</footer>
