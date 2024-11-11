// 클라우드 플레어 엣지 캐시 삭제용 함수
export const deleteEdgeCache = async (url: string, platform?: any) => {
  const CF_ZONE_ID = process.env.CF_ZONE_ID || platform?.env?.CF_ZONE_ID || '';
  const CF_API_TOKEN = process.env.CF_API_TOKEN || platform?.env?.CF_API_TOKEN || '';

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: [url] })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`캐시 삭제 실패: ${JSON.stringify(result)}`);
    }

    return result;
  } catch (error) {
    console.error('엣지 캐시 삭제 중 오류 발생:', error);
    throw error;
  }
};
