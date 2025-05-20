// --- src/routes/api/verify-recaptcha/+server.ts ---
import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import type {
  JwtHeader,
  SigningKeyCallback,
  GetPublicKeyOrSecret,
} from "jsonwebtoken";

// 중요: 실제 Firebase 프로젝트 ID로 변경해주세요.
// src/lib/login/firebase_google_login.ts 파일의 firebaseConfig.projectId 값을 사용하세요.
const FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID"; // Firebase Console > 프로젝트 설정 > 일반 > 프로젝트 ID

// Google 공개 키 엔드포인트
const GOOGLE_PUBLIC_KEY_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

// 간단한 인메모리 캐시 (실제 프로덕션에서는 더 견고한 캐싱 전략 필요)
let googlePublicKeys: { [kid: string]: string } | null = null;
let lastKeyFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1시간 캐시

async function getGooglePublicKey(
  header: JwtHeader,
  callback: SigningKeyCallback
) {
  if (!header.kid) {
    return callback(new Error("No kid in JWT header"));
  }
  const kid = header.kid;

  const now = Date.now();
  if (!googlePublicKeys || now - lastKeyFetchTime > CACHE_DURATION_MS) {
    try {
      const response = await fetch(GOOGLE_PUBLIC_KEY_URL);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Google public keys: ${response.statusText}`
        );
      }
      googlePublicKeys = (await response.json()) as { [kid: string]: string };
      lastKeyFetchTime = now;
      console.log("Fetched and cached Google public keys.");
    } catch (error) {
      console.error("Error fetching Google public keys:", error);
      // 캐시 실패 시 기존 키가 있다면 사용, 없다면 에러 콜백
      if (googlePublicKeys && googlePublicKeys[kid]) {
        return callback(null, googlePublicKeys[kid]);
      }
      return callback(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  if (googlePublicKeys && googlePublicKeys[kid]) {
    callback(null, googlePublicKeys[kid]);
  } else {
    // 키가 만료되어 새로 가져왔음에도 해당 kid가 없을 수 있음. 이 경우 캐시를 비우고 재시도 유도.
    googlePublicKeys = null; // 캐시 무효화
    callback(new Error(`Unknown kid: ${kid}. Public keys may need refresh.`));
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return new Response(
        JSON.stringify({ success: false, error: "ID token is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // JWT 검증
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getGooglePublicKey as GetPublicKeyOrSecret, // 타입 단언
        {
          algorithms: ["RS256"],
          issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
          audience: FIREBASE_PROJECT_ID,
        },
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        }
      );
    });

    // 검증 성공
    return new Response(JSON.stringify({ success: true, decodedToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Token verification failed: ${error.message}`,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
};
