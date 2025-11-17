/**
 * 이미지를 미리 로드하는 유틸리티 함수
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * 여러 이미지를 병렬로 미리 로드
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(url => preloadImage(url)));
  } catch (error) {
    console.error('Error preloading images:', error);
    throw error;
  }
};

/**
 * 게임에 필요한 모든 이미지 리소스를 미리 로드
 */
export const preloadGameAssets = async (playerNames: string[]): Promise<void> => {
  // 게임에서 사용되는 모든 이미지 URL
  const imageUrls = [
    '/background.png',
    '/stopandgo.png',
    '/images/forest.png',
    '/images/undersea.png',
    '/images/space.png',
  ];

  // 플레이어 아바타 URL 추가 (DiceBear API)
  const avatarUrls = playerNames.map(
    name => `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(name)}&size=112`
  );

  // 모든 이미지를 병렬로 로드
  await preloadImages([...imageUrls, ...avatarUrls]);
};

