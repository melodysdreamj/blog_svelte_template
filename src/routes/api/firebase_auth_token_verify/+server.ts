// --- src/routes/api/firebase_auth_token_verify/+server.ts ---
import type { RequestHandler } from "@sveltejs/kit";
import * as jose from "jose"; // 'jose' 라이브러리 import

// 중요: 실제 Firebase 프로젝트 ID로 변경해주세요.
// src/lib/login/firebase_google_login.ts 파일의 firebaseConfig.projectId 값을 사용하세요.
const FIREBASE_PROJECT_ID = "YOUR_PROJECT_ID"; // Firebase Console > 프로젝트 설정 > 일반 > 프로젝트 ID

// Google 공개 키 엔드포인트
const GOOGLE_PUBLIC_KEY_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

async function getVerificationKey(token: string): Promise<CryptoKey> {
  const protectedHeader = jose.decodeProtectedHeader(token);
  const kid = protectedHeader.kid;

  if (!kid) {
    // jose.errors.JWSInvalid는 클라이언트 사이드 에러에 더 적합할 수 있으나,
    // 여기서는 일반 Error 또는 특정 커스텀 에러를 사용하는 것이 나을 수 있습니다.
    // 또는 에러 코드와 함께 구체적인 메시지를 전달합니다.
    throw new Error("Token_verification_failed:_No_kid_in_JWT_header");
  }

  const response = await fetch(GOOGLE_PUBLIC_KEY_URL);
  if (!response.ok) {
    throw new Error(
      `Token_verification_failed:_Failed_to_fetch_Google_public_keys_(${response.statusText})`
    );
  }

  // Google의 응답은 { kid: pemString, ... } 형태의 객체입니다.
  const publicKeys = (await response.json()) as { [kid: string]: string };
  const pemKey = publicKeys[kid];

  if (!pemKey) {
    throw new Error(
      `Token_verification_failed:_No_matching_key_found_for_kid_(${kid})`
    );
  }

  // PEM 형식의 키를 jose가 사용할 수 있도록 X.509 인증서로 변환
  // 'RS256'은 이 키로 검증할 알고리즘을 명시합니다. 토큰 헤더의 alg와 일치해야 합니다.
  try {
    return await jose.importX509(pemKey, "RS256");
  } catch (e: any) {
    // importX509 실패 시 (예: PEM 형식이 잘못된 경우)
    console.error("Error importing X.509 key:", e);
    throw new Error(
      `Token_verification_failed:_Could_not_import_public_key_(${e.message})`
    );
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const idToken = body.idToken as string;

    if (!idToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID token is required.",
          errorCode: "MISSING_ID_TOKEN",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const verificationKey = await getVerificationKey(idToken);

    const { payload } = await jose.jwtVerify(idToken, verificationKey, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
      algorithms: ["RS256"],
    });

    return new Response(
      JSON.stringify({ success: true, decodedToken: payload }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    let errorMessage = `Token verification failed: ${error.message || "Unknown error"}`;
    let errorCode = error.code || "UNKNOWN_VERIFICATION_ERROR"; // jose 에러 코드 또는 커스텀 에러 메시지에서 추출한 코드

    // getVerificationKey 내부에서 throw된 에러 메시지 파싱 (좀 더 나은 방법은 커스텀 에러 클래스 사용)
    if (error.message?.startsWith("Token_verification_failed:_")) {
      const specificError = error.message
        .replace("Token_verification_failed:_", "")
        .replace(/_\(/g, " (")
        .replace(/_\)/g, ")")
        .replace(/_/g, " ");
      errorMessage = specificError;
      // errorCode도 여기서 좀 더 구체화할 수 있습니다. 예를 들어:
      if (specificError.includes("No kid in JWT header"))
        errorCode = "NO_KID_IN_HEADER";
      else if (specificError.includes("Failed to fetch Google public keys"))
        errorCode = "FETCH_PUBLIC_KEY_FAILED";
      else if (specificError.includes("No matching key found for kid"))
        errorCode = "NO_MATCHING_KEY_FOR_KID";
      else if (specificError.includes("Could not import public key"))
        errorCode = "PUBLIC_KEY_IMPORT_FAILED";
    } else if (error instanceof jose.errors.JWTClaimValidationFailed) {
      errorMessage = `Token verification failed: Claim validation failed. Claim: ${error.claim}, Reason: ${error.reason}`;
      errorCode = error.code; // "ERR_JWT_CLAIM_VALIDATION_FAILED"
    } else if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      errorMessage =
        "Token verification failed: Signature verification failed.";
      errorCode = error.code; // "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    } else if (
      error instanceof jose.errors.JWSInvalid ||
      error instanceof jose.errors.JWKInvalid
    ) {
      errorMessage = `Token verification failed: JWS/JWK is invalid. ${error.message}`;
      errorCode = error.code;
    }
    // 그 외 jose 에러들 (예: ERR_JWT_EXPIRED, ERR_JWT_NOT_YET_VALID 등)은 error.code와 error.message로 잡힐 수 있음

    console.error(
      "Detailed Token verification error:",
      errorMessage,
      "Code:",
      errorCode,
      "Original Error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        errorCode: errorCode,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
};
