# 시작가이드 


## 프로젝트 생성하기
1. 다음 터미널에 입력하기
```bash
npm create svelte@latest [앱이름]
cd [앱이름]
npm install
npm run dev
```

## tailwind 적용하기
1. [다음링크](https://tailwindcss.com/docs/guides/sveltekit) 를 따라가며 적용해줍니다.

## 클라우드플레어에 올리기
- 깃허브에 새로운 레포에 올려두기
- [다음링크](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-site/#usage) 를 보고 적용해줍니다. 

   1. 이때 다 package.json 에 다음을 넣어줍니다.
      - 현재 node 18~19 를 클라우드플레어에서 지원못하기 때문에 그에 맞춰 라이브러리를 생성해줘야한다.
```
"@sveltejs/adapter-cloudflare": "1.0.0-next.45",
"@fontsource/fira-mono": "^4.5.10",
"@sveltejs/adapter-auto": "1.0.0-next.91",
"@sveltejs/kit": "1.0.0-next.589"
```

- 다음 파일(.node-version)을 만들어서 내용을 넣어주기
   - 현재 node 18~19 를 클라우드플레어에서 지원못하기 때문에 17로 맞춰줘야한다.
```text
17.9.1
```

- 다음 참조해서 app.d.ts 파일꾸미기
```ts
	declare namespace App {
		// interface Error {}
		interface Locals {}
		// interface PageData {}
		interface Platform {
			env: {
				TESTKV: test;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache }
		}

		interface Session {}

		interface Stuff {}
	}
```

- 클라우드플레어[콘솔](https://dash.cloudflare.com/362e0c97b9227574746837c064f4d3a5/pages) 에 들어가서 > pages > Create a project > Connect to GitHub > Add account > Only select repositories > [레포이름] > save > 해당 레포 선택 > Framework preset 에서 "sveltekit" 선택 > 


### * 커스텀 도메인 추가하는 방법
1. [콘솔](https://dash.cloudflare.com/362e0c97b9227574746837c064f4d3a5/pages) 에서 해당 레포로 들어간다음, Custom domains 에서 "Set up a custom domain" > 클라우드플레어에 등록한 도메인을 입력한다.
   * 이때 서브도메인.메인도메인.com 처럼입력할경우 자동으로 해당서브도메인이 적용된다.
   * 프레뷰는 서브도메인으로 얼마든지 할수있으나, 프로덕트 모드로 하고싶다면 레포를 새로 만들어야한다. 전체 복사 붙여넣기후 새 레포 파는 식으로 가야한다.


## gitingore 에 다음추가하기
```text
.DS_Store
node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
.vercel
.output
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
```


## dynamoDB 사용하기위해서 
1. .env 파일에 다음 내용 추가하기
```text
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

2. 해당 값을 클라우드플레어 콘솔에서 확인해서 넣어준다.



## delete cloudflare edge cache
1. .env 파일에 다음 내용 추가하기
```text
CF_ZONE_ID=
CF_API_TOKEN=
```
### 1. Finding Your Zone ID

The **Zone ID** is a unique identifier used by Cloudflare to manage each site (domain) individually. Follow these steps to find your Zone ID:

1. Log in to your Cloudflare account.
2. From the dashboard, select the domain you want to manage.
3. On the **Overview** page of your site, locate the Zone ID. It is usually displayed toward the bottom of the page as a unique identifier.

### 2. Generating an API Token

An **API Token** allows you to authenticate with the Cloudflare API, with customizable permissions for security and access control.

1. Log in to your Cloudflare account.
2. Click on the profile icon in the top-right corner and select **My Profile**.
3. Go to the **API Tokens** tab.
4. Click on **Create Token** to generate a new API Token.
5. You can select a pre-built template, such as **Edit Zone DNS** or **Cache Purge**, or create a custom token with specific permissions as outlined below:
   - **Permissions**: `Zone - Cache Purge - Edit`
   - **Zone Resources**: Select the necessary domain(s) or choose **All Zones** if required.
6. After configuring the token, click **Continue to summary**, then select **Create Token**.
7. Copy the token immediately and store it securely, as it will only be displayed once for security reasons.
