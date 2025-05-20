<script context="module" lang="ts">
  // 모든 내용을 AuthLib로 이전했으므로 이 context="module"은 비워두거나,
  // Main 페이지에만 특화된 module-level 로직이 있다면 그것만 남깁니다.
  // 현재로서는 AuthLib에서 모든 것을 가져오므로 거의 비어있게 됩니다.

  // 만약 Main 페이지 자체에서 module 스코프에서만 실행되어야 할 타입 정의 등이 있다면 여기에 남길 수 있습니다.
  // 예: export type MainPageSpecificType = { ... };

  // GOOGLE_CLIENT_ID도 AuthLib에서 가져올 것이므로 여기서 제거합니다.
  // 스토어 및 핵심 함수들도 AuthLib에서 가져옵니다.
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import {
    currentUser, // 스토어 ($ 접두사로 접근)
    authLoading, // 스토어 ($ 접두사로 접근)
    authErrorStore, // 스토어 (구독 또는 $ 접두사로 접근)
    handleGoogleSignInWithCredentialToken, // 함수
    logout, // 함수
    GOOGLE_CLIENT_ID, // 상수
  } from "$lib/login/firebase_google_login";
  import type { User } from "firebase/auth"; // User 타입은 여전히 필요할 수 있음

  // 로컬 error 변수는 스토어의 authErrorStore를 반영 (UI 표시용)
  let localError: string | null = null;
  // authErrorStore 구독 콜백의 value 타입 명시 (이미 User | null로 되어 있을 것임)
  const unsubscribeError = authErrorStore.subscribe(
    (value) => (localError = value)
  );

  let gisScriptLoaded = false;
  let gisClientInitializedForButton = false;
  let googleButtonRendered = false;
  let observer: MutationObserver | null = null;

  async function initializeGisClient() {
    if (gisClientInitializedForButton || !gisScriptLoaded) return;

    if (
      (window as any).google &&
      (window as any).google.accounts &&
      (window as any).google.accounts.id
    ) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID, // AuthLib에서 가져온 GOOGLE_CLIENT_ID 사용
          callback: async (response: any) => {
            const idToken = response.credential;
            if (!idToken) {
              authErrorStore.set("Google ID 토큰을 가져오지 못했습니다.");
              return;
            }
            // AuthLib에서 가져온 handleGoogleSignInWithCredentialToken 사용
            await handleGoogleSignInWithCredentialToken(idToken);
          },
        });
        gisClientInitializedForButton = true;
      } catch (e) {
        authErrorStore.set("Google 로그인 클라이언트 초기화 실패.");
      }
    } else {
      console.error(
        "[GIS LifeCycle]: Google Identity Services not available on window."
      );
    }
  }

  async function renderGoogleButton() {
    // $currentUser 스토어 직접 참조 (AuthLib에서 가져온 스토어)
    if (googleButtonRendered || !gisClientInitializedForButton || $currentUser)
      return;
    const signInButtonContainer = document.getElementById(
      "g_id_signin_button_container_login2"
    );

    if (signInButtonContainer) {
      try {
        (window as any).google.accounts.id.renderButton(signInButtonContainer, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
        });
        googleButtonRendered = true;

        if (!$currentUser && (window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (
              notification.isNotDisplayed() ||
              notification.isSkippedMoment()
            ) {
              console.warn(
                "[GIS One Tap]: Prompt was not displayed or skipped. Reason:",
                notification.getNotDisplayedReason() ||
                  notification.getSkippedReason()
              );
            } else if (notification.isDismissedMoment()) {
              console.log(
                "[GIS One Tap]: Prompt was dismissed by user. Reason:",
                notification.getDismissedReason()
              );
            }
          });
        }
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      } catch (e) {
        authErrorStore.set("Google 로그인 버튼 표시 중 오류 발생.");
      }
    } else {
      if (!observer && document.body) {
        observer = new MutationObserver(async (mutationsList, obs) => {
          const targetNode = document.getElementById(
            "g_id_signin_button_container_login2"
          );
          if (targetNode && !googleButtonRendered) {
            obs.disconnect();
            observer = null;
            await tick();
            renderGoogleButton();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }
  }

  onMount(() => {
    // Firebase는 context="module"에서 이미 초기화됨.
    // GSI 스크립트 로드가 안되어 있다면 로드
    if (typeof window !== "undefined") {
      const scriptId = "google-gsi-script-login2";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          gisScriptLoaded = true;
          initializeGisClient();
        };
        script.onerror = () =>
          authErrorStore.set("Google 로그인 스크립트 로드 실패.");
        document.head.appendChild(script);
      } else {
        gisScriptLoaded = true;
        initializeGisClient();
      }
    }

    return () => {
      if (observer) observer.disconnect();
      unsubscribeError(); // 컴포넌트 파괴 시 에러 스토어 구독 해제
    };
  });

  // 반응형 로직들: 스토어 값을 참조하여 단순화
  $: if (
    !$currentUser &&
    gisClientInitializedForButton &&
    !googleButtonRendered &&
    !$authLoading
  ) {
    renderGoogleButton();
  }

  $: if ($currentUser && googleButtonRendered) {
    googleButtonRendered = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login - CANTO</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
    rel="stylesheet"
  />
  <style>
    html,
    body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none;
    }
    .error-message {
      color: #d93025;
      margin-top: 15px;
      font-weight: bold;
    }
    .user-info-container {
      margin-top: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
  </style>
</svelte:head>

<div
  class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 max-w-7xl mx-auto lg:px-8"
>
  <div class="sm:mx-auto sm:w-full sm:max-w-lg">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
      CANTO 계정에 로그인하세요
    </h2>
    {#if localError}
      <!-- localError 사용 또는 $authErrorStore 직접 사용 -->
      <p class="error-message text-center">{localError}</p>
    {/if}
    {#if $authLoading}
      <p class="text-center mt-4">로딩 중...</p>
    {/if}
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {#if $currentUser}
        <div class="user-info-container text-center">
          <h3 class="text-xl font-semibold text-gray-800">환영합니다!</h3>
          <p class="text-gray-600">
            {$currentUser.displayName || $currentUser.email}
          </p>
          {#if $currentUser.photoURL}
            <img
              src={$currentUser.photoURL}
              alt="프로필 사진"
              class="w-20 h-20 rounded-full mx-auto my-4"
            />
          {/if}
          <button
            on:click={logout}
            class="w-full mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={$authLoading}
          >
            {$authLoading ? "처리 중..." : "로그아웃"}
          </button>
        </div>
      {:else if !$authLoading}
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500"
              >Google 계정으로 계속하기</span
            >
          </div>
        </div>
        <div
          id="g_id_signin_button_container_login2"
          style="display: flex; justify-content: center; margin-top: 20px;"
        >
          <!-- GIS 버튼 렌더링 위치 -->
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  body {
    font-family: "Inter", "Noto Sans KR", sans-serif;
  }
</style>
