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
    style = {}
}) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const frameInterval = 1000 / fps;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % totalFrames);
        }, frameInterval);

        return () => clearInterval(interval);
    }, [totalFrames, frameInterval]);

    const col = currentFrame % columns;
    const row = Math.floor(currentFrame / columns);

    // 각 프레임의 위치를 백분율로 계산
    const percentX = columns > 1 ? (col / (columns - 1)) * 100 : 0;
    const percentY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

    return (
        <div
            className={className}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: `url(${spritePath})`,
                backgroundSize: `${columns * 100}% ${rows * 100}%`,
                backgroundPosition: `${percentX}% ${percentY}%`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                ...style
            }}
        />
    );
};

export default SpritePlayer;
