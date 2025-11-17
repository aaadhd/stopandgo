import React, { useState, useEffect } from 'react';

interface SpritePlayerProps {
    spritePath: string;
    totalFrames: number;
    columns: number;
    rows: number;
    fps?: number;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    loopDelay?: number; // 루프 사이클 간 지연 시간 (밀리초)
    reversed?: boolean; // 역순 재생 여부
}

const SpritePlayer: React.FC<SpritePlayerProps> = ({
    spritePath,
    totalFrames,
    columns,
    rows,
    fps = 12,
    width = 48,
    height = 100,
    className = '',
    style = {},
    loopDelay = 0,
    reversed = false
}) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const frameInterval = 1000 / fps;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => {
                const nextFrame = (prev + 1) % totalFrames;
                
                // 마지막 프레임에서 처음으로 돌아갈 때 딜레이 적용
                if (nextFrame === 0 && loopDelay > 0 && prev === totalFrames - 1) {
                    setTimeout(() => {
                        setCurrentFrame(0);
                    }, loopDelay);
                    return prev; // 현재 프레임 유지
                }
                
                return nextFrame;
            });
        }, frameInterval);

        return () => clearInterval(interval);
    }, [totalFrames, frameInterval, loopDelay]);

    // 역순 재생인 경우 프레임 순서를 반대로
    const displayFrame = reversed ? totalFrames - 1 - currentFrame : currentFrame;
    const col = displayFrame % columns;
    const row = Math.floor(displayFrame / columns);

    // 각 프레임의 위치를 음수 픽셀 값으로 정확하게 계산
    const frameWidth = width;
    const frameHeight = height;
    const offsetX = -(col * frameWidth);
    const offsetY = -(row * frameHeight);
    
    // 소수점 정렬을 위한 반올림 처리
    const roundedOffsetX = Math.round(offsetX);
    const roundedOffsetY = Math.round(offsetY);

    return (
        <div
            className={className}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: `url(${spritePath})`,
                backgroundSize: `${columns * frameWidth}px ${rows * frameHeight}px`,
                backgroundPosition: `${roundedOffsetX}px ${roundedOffsetY}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'crisp-edges',
                ...style
            }}
        />
    );
};

export default SpritePlayer;
