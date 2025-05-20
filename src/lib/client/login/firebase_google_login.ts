import { writable, type Writable } from "svelte/store";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
  type Auth,
  type User,
  type AuthError,
} from "firebase/auth";

// Firebase 구성 (환경 변수 등으로 관리하는 것이 이상적)
const YOUR_CUSTOM_DOMAIN = "YOUR_FIREBASE_AUTH_DOMAIN"; // Firebase Console > Authentication > 설정 > 승인된 도메인
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Firebase Console > 프로젝트 설정 > 일반 > 웹 API 키
  authDomain: YOUR_CUSTOM_DOMAIN,
  projectId: "YOUR_PROJECT_ID", // Firebase Console > 프로젝트 설정 > 일반 > 프로젝트 ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Firebase Console > Storage > 규칙 (gs://<YOUR_STORAGE_BUCKET>)
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Firebase Console > 프로젝트 설정 > 클라우드 메시징 > 발신자 ID
  appId: "YOUR_APP_ID", // Firebase Console > 프로젝트 설정 > 일반 > 앱 ID
  measurementId: "YOUR_MEASUREMENT_ID", // Firebase Console > 프로젝트 설정 > 일반 > 측정 ID (선택 사항)
};

export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Google Cloud Console > API 및 서비스 > 사용자 인증 정보 > OAuth 2.0 클라이언트 ID (웹 클라이언트 유형)

let app: FirebaseApp;
let auth: Auth;

// Svelte Stores - 이 모듈이 직접 관리
export const currentUser: Writable<User | null> = writable(null);
export const authLoading: Writable<boolean> = writable(true);
export const authErrorStore: Writable<string | null> = writable(null);

let internalAuthUnsubscribe: (() => void) | null = null;

function initializeFirebaseAndAuth() {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 Firebase 초기화를 수행하지 않거나 다른 방식으로 처리
    // authLoading.set(false); // 또는 true로 유지하여 클라이언트에서 처리하도록 유도
    console.warn("[AuthLib] Firebase initialization skipped on server side.");
    return;
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("[AuthLib] Firebase app initialized.");
  } else {
    app = getApp();
    console.log(
      "[AuthLib] Firebase app already initialized. Using existing app."
    );
  }
  auth = getAuth(app);

  if (internalAuthUnsubscribe) {
    internalAuthUnsubscribe(); // 기존 구독 해제
  }

  authLoading.set(true); // 구독 시작 전 로딩 상태로 설정
  internalAuthUnsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      console.log("[AuthLib] onAuthStateChanged. User:", user?.email);
      currentUser.set(user);
      authErrorStore.set(null); // 성공 시 에러 초기화
      authLoading.set(false);
    },
    (error) => {
      console.error("[AuthLib] onAuthStateChanged error", error);
      authErrorStore.set(error.message);
      currentUser.set(null);
      authLoading.set(false);
    }
  );
}

// 모듈이 로드될 때 (클라이언트 사이드에서만) Firebase 초기화 실행
initializeFirebaseAndAuth();

// Exported API Functions
export function isLoggedIn(): boolean {
  let loggedIn = false;
  // 스토어의 현재 값을 동기적으로 읽기 위한 임시 구독
  const unsubscribe = currentUser.subscribe((value) => {
    loggedIn = !!value;
  });
  unsubscribe();
  return loggedIn;
}

export function getUserInfo(): User | null {
  let user: User | null = null;
  const unsubscribe = currentUser.subscribe((value) => {
    user = value;
  });
  unsubscribe();
  return user;
}

export async function fetchIdToken(user: User | null): Promise<string | null> {
  if (!auth && typeof window !== "undefined") {
    // 이 경우는 initializeFirebaseAndAuth가 제대로 호출되지 않았음을 의미할 수 있음.
    // 하지만 보통 initializeFirebaseAndAuth는 모듈 로드 시 실행됨.
    console.warn(
      "[AuthLib] fetchIdToken: Auth not initialized. Attempting re-init."
    );
    initializeFirebaseAndAuth(); // 안전장치로 재시도
    if (!auth) {
      authErrorStore.set(
        "[AuthLib] fetchIdToken: Auth could not be initialized."
      );
      return null;
    }
  }
  if (user && typeof user.getIdToken === "function") {
    try {
      const token = await user.getIdToken();
      return token || null; // token이 빈 문자열일 경우 null로 처리
    } catch (e) {
      authErrorStore.set(
        `[AuthLib] fetchIdToken Error: ${(e as Error).message}`
      );
      console.error("[AuthLib] fetchIdToken: Error:", e);
      return null;
    }
  } else {
    if (!user) {
      // console.warn("[AuthLib] fetchIdToken: User object provided was null.");
    } else {
      // console.warn("[AuthLib] fetchIdToken: Provided user object does not have a valid getIdToken method.");
      authErrorStore.set("[AuthLib] User object does not have getIdToken.");
    }
    return null;
  }
}

export async function handleGoogleSignInWithCredentialToken(
  idToken: string
): Promise<User | null> {
  if (!auth) {
    authErrorStore.set("[AuthLib] GoogleSignIn: Auth not initialized.");
    return null;
  }
  authLoading.set(true);
  const credential = GoogleAuthProvider.credential(idToken);
  try {
    const userCredential = await signInWithCredential(auth, credential);
    // onAuthStateChanged가 currentUser 스토어를 업데이트하므로, 여기서는 userCredential.user를 반환
    authLoading.set(false); // 성공 시 로딩 해제 명시
    return userCredential.user;
  } catch (e: any) {
    const firebaseError = e as AuthError;
    authErrorStore.set(
      `[AuthLib] GoogleSignIn Error: ${firebaseError.message} (Code: ${firebaseError.code})`
    );
    console.error("[AuthLib] GoogleSignIn Error:", firebaseError);
    currentUser.set(null); // 에러 시 명시적으로 사용자 null 처리
    authLoading.set(false);
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!auth) {
    authErrorStore.set("[AuthLib] Logout: Auth not initialized.");
    return;
  }
  authLoading.set(true); // 로그아웃 시작 시 로딩 상태
  try {
    await signOut(auth);
    // onAuthStateChanged가 currentUser를 null로, authLoading을 false로 설정할 것임
  } catch (e: any) {
    const firebaseError = e as AuthError;
    authErrorStore.set(`[AuthLib] Logout Error: ${firebaseError.message}`);
    console.error("[AuthLib] Logout Error:", firebaseError);
    authLoading.set(false); // 에러 시 로딩 상태 명시적 해제
  }
}
