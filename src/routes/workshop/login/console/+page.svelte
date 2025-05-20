<script lang="ts">
  import { onMount } from "svelte";
  import {
    isLoggedIn,
    getUserInfo,
    fetchIdToken,
    logout,
    currentUser,
  } from "$lib/login/firebase_google_login";
  import type { User } from "firebase/auth";

  let loggedInStatus: boolean | null = null;
  let localUserInfo: User | null = null;
  let idToken: string | null = null;
  let message: string = "";

  currentUser.subscribe((value: User | null) => {
    localUserInfo = value;
    loggedInStatus = !!value;
    if (!value) {
      idToken = null;
    }
  });

  onMount(() => {
    checkCurrentLoginStatus();
  });

  async function checkCurrentLoginStatus() {
    message = "로그인 상태 확인 중...";
    if (typeof isLoggedIn !== "function") {
      message =
        "[Console] 로그인 기능을 사용할 수 없습니다. 초기화 문제일 수 있습니다.";
      loggedInStatus = false;
      return;
    }

    loggedInStatus = isLoggedIn();

    if (loggedInStatus) {
      message = localUserInfo
        ? `로그인 되어 있습니다 (${localUserInfo.email}).`
        : "로그인 되어 있으나 사용자 정보 없음 (스토어 확인 중)";
    } else {
      message = "로그인되어 있지 않습니다.";
    }
  }

  async function handleGetUserInfo() {
    message = "사용자 정보 가져오는 중...";
    if (loggedInStatus) {
      if (localUserInfo) {
        message = "사용자 정보를 표시합니다 (스토어 구독 값).";
      } else {
        message =
          "사용자 정보를 가져올 수 없습니다 (로그인은 되어 있지만 정보가 없음).";
      }
    } else {
      localUserInfo = null;
      message = "로그인되어 있지 않아 사용자 정보를 가져올 수 없습니다.";
    }
  }

  async function handleFetchIdToken() {
    message = "ID 토큰 요청 중...";
    if (loggedInStatus && localUserInfo) {
      idToken = await fetchIdToken(localUserInfo);
      if (idToken) {
        message = "ID 토큰을 가져왔습니다.";
      } else {
        message =
          "ID 토큰을 가져오지 못했습니다 (프록시 또는 원본 함수에서 문제 발생 가능).";
      }
    } else if (!loggedInStatus) {
      idToken = null;
      message = "로그인되어 있지 않아 ID 토큰을 요청할 수 없습니다.";
    } else {
      idToken = null;
      message = "사용자 정보가 없어 ID 토큰을 요청할 수 없습니다.";
    }
  }

  async function handleLogout() {
    message = "로그아웃 중...";
    if (typeof logout !== "function") {
      message = "[Console] 로그아웃 기능을 사용할 수 없습니다.";
      return;
    }
    try {
      await logout();
      message =
        "로그아웃 되었습니다. 상태가 자동으로 갱신됩니다 (스토어 구독).";
    } catch (e) {
      message = `[Console] 로그아웃 중 오류 발생: ${(e as Error).message}`;
      console.error("[Console] Logout error caught in page:", e);
    }
  }
</script>

<svelte:head>
  <title>Login Function Tester (Console via Proxy)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    .controls {
      margin-top: 15px;
      margin-bottom: 15px;
    }
    .controls button {
      margin-right: 5px;
    }
    .status,
    .user-info,
    .token-info {
      margin-top: 15px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #e9ecef;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-all;
      background-color: #fff;
      padding: 10px;
      border-radius: 4px;
    }
    .message {
      margin-top: 10px;
      padding: 10px;
      background-color: #f8f9fa;
      border: 1px solid #ced4da;
      border-radius: 4px;
      color: #495057;
    }
  </style>
</svelte:head>

<div class="container">
  <h1>Login Proxy 함수 테스터 (Console)</h1>
  <p>
    이 페이지는 <code>$lib/login/firebase_google_login.ts</code>의 로그인 기능을
    테스트합니다.
  </p>
  <p>
    <strong>참고:</strong> 먼저
    <a href="/workshop/login/main" target="_blank">로그인 페이지 (Main)</a>를
    방문하여 Google GSI 스크립트가 로드되고 Firebase가 정상적으로 초기화되었는지
    확인하는 것이 좋습니다. 프록시 모듈은 Main 모듈의 초기화에 의존합니다.
  </p>

  <div class="controls">
    <button
      on:click={checkCurrentLoginStatus}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1"
      >로그인 상태 새로고침</button
    >
    <button
      on:click={handleGetUserInfo}
      disabled={!loggedInStatus}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1 disabled:opacity-50"
      >사용자 정보 표시</button
    >
    <button
      on:click={handleFetchIdToken}
      disabled={!loggedInStatus || !localUserInfo}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1 disabled:opacity-50"
      >ID 토큰 요청</button
    >
    <button
      on:click={handleLogout}
      disabled={!loggedInStatus}
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-1 disabled:opacity-50"
      >로그아웃</button
    >
  </div>

  {#if message}
    <div class="message"><strong>상태 메시지:</strong> {message}</div>
  {/if}

  <div class="status">
    <strong>현재 로그인 상태:</strong>
    {#if loggedInStatus === null}
      <span>확인 중...</span>
    {:else if loggedInStatus}
      <span style="color: green;">로그인됨</span>
      {#if localUserInfo?.email}
        (Email: {localUserInfo.email})
      {/if}
    {:else}
      <span style="color: red;">로그인 안됨</span>
    {/if}
  </div>

  {#if loggedInStatus && localUserInfo}
    <div class="user-info">
      <h3>사용자 정보 (스토어 구독 값):</h3>
      <pre>{JSON.stringify(localUserInfo, null, 2)}</pre>
    </div>
  {/if}

  {#if idToken}
    <div class="token-info">
      <h3>ID 토큰:</h3>
      <pre>{idToken}</pre>
    </div>
  {/if}
</div>
