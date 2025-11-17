// A single AudioContext to be reused, initialized on the first sound play.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    // Check if running in a browser environment
    if (typeof window === 'undefined') return null;

    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            return null;
        }
    }
    return audioContext;
};

export type SoundType =
    | 'start'
    | 'click'
    | 'move'
    | 'move-boost'
    | 'move-slow'
    | 'penalty'
    | 'collect-good'
    | 'collect-bad'
    | 'round-win'
    | 'time-up'
    | 'quiz-correct'
    | 'quiz-incorrect'
    | 'game-over-win'
    | 'shield-break'
    | 'countdown'
    | 'countdown-go'
    | 'button-hover'
    | 'item-appear'
    | 'item-disappear'
    | 'frozen'
    | 'slowed';


/**
 * Contains the actual logic for generating audio tones for different game events.
 * @param ctx The active AudioContext.
 * @param type The type of sound to play.
 */
const playSoundLogic = (ctx: AudioContext, type: SoundType) => {
    const playTone = (freq: number, duration: number, wave: OscillatorType = 'sine', volume: number = 0.25) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    };
    
    const playSequence = (notes: {freq: number, duration: number, delay: number, vol?: number, wave?: OscillatorType}[]) => {
         notes.forEach(note => {
             setTimeout(() => playTone(note.freq, note.duration, note.wave, note.vol), note.delay);
         });
    };

    switch (type) {
        case 'start':
            playSequence([
                { freq: 261.63, duration: 0.1, delay: 0 },
                { freq: 329.63, duration: 0.1, delay: 120 },
                { freq: 392.00, duration: 0.1, delay: 240 },
                { freq: 523.25, duration: 0.2, delay: 360, vol: 0.3 },
            ]);
            break;
        case 'click':
            playTone(440, 0.08, 'triangle', 0.2);
            break;
        case 'move':
            playTone(1200 + Math.random() * 200, 0.03, 'square', 0.1);
            break;
        case 'move-boost':
            playTone(1600 + Math.random() * 200, 0.04, 'sine', 0.15);
            break;
        case 'move-slow':
            playTone(600 + Math.random() * 100, 0.06, 'triangle', 0.08);
            break;
        case 'penalty':
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.type = 'sawtooth';
             gain.gain.setValueAtTime(0.35, ctx.currentTime);
             osc.frequency.setValueAtTime(500, ctx.currentTime);
             osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
             gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
             osc.start();
             osc.stop(ctx.currentTime + 0.4);
            break;
        case 'collect-good':
            playSequence([
                { freq: 587.33, duration: 0.05, delay: 0, wave: 'sine' },   // D5
                { freq: 880.00, duration: 0.1, delay: 60, wave: 'sine' },  // A5
            ]);
            break;
        case 'collect-bad':
            playTone(164.81, 0.2, 'sawtooth', 0.25); // E3
            break;
        case 'round-win':
             playSequence([
                { freq: 523.25, duration: 0.1, delay: 0 },    // C5
                { freq: 659.26, duration: 0.1, delay: 120 },  // E5
                { freq: 783.99, duration: 0.1, delay: 240 },  // G5
                { freq: 1046.50, duration: 0.25, delay: 360, vol: 0.35 },  // C6
            ]);
            break;
        case 'time-up':
            playTone(261.63, 0.6, 'square', 0.3);
            break;
        case 'quiz-correct':
            playSequence([
                { freq: 659.26, duration: 0.1, delay: 0, wave: 'triangle' },
                { freq: 987.77, duration: 0.15, delay: 120, wave: 'triangle' },
            ]);
            break;
        case 'quiz-incorrect':
            playSequence([
                { freq: 220.00, duration: 0.1, delay: 0, wave: 'square' },
                { freq: 185.00, duration: 0.2, delay: 120, wave: 'square' },
            ]);
            break;
        case 'shield-break':
            const noiseOscillator = ctx.createBufferSource();
            const bufferSize = ctx.sampleRate * 0.15; // 0.15s duration
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            noiseOscillator.buffer = buffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
            noiseOscillator.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseOscillator.start();
            break;
        case 'game-over-win':
             playSequence([
                { freq: 523.25, duration: 0.1, delay: 0 },
                { freq: 392.00, duration: 0.1, delay: 150 },
                { freq: 659.26, duration: 0.1, delay: 300 },
                { freq: 523.25, duration: 0.1, delay: 450 },
                { freq: 783.99, duration: 0.4, delay: 600, vol: 0.35 },
            ]);
            break;
        case 'countdown':
            // 카운트다운 숫자 소리 (3, 2, 1)
            playTone(659.26, 0.15, 'sine', 0.3); // E5
            break;
        case 'countdown-go':
            // GO! 소리 (더 흥분되는 소리)
            playSequence([
                { freq: 783.99, duration: 0.1, delay: 0, wave: 'sine' },   // G5
                { freq: 1046.50, duration: 0.2, delay: 100, wave: 'sine', vol: 0.35 },  // C6
            ]);
            break;
        case 'button-hover':
            // 버튼 호버 소리 (미세한 피드백)
            playTone(880, 0.05, 'sine', 0.1);
            break;
        case 'item-appear':
            // 아이템 나타남 (반짝이는 소리)
            playSequence([
                { freq: 1046.50, duration: 0.05, delay: 0, wave: 'sine', vol: 0.15 },
                { freq: 1318.51, duration: 0.08, delay: 60, wave: 'sine', vol: 0.15 },
            ]);
            break;
        case 'item-disappear':
            // 아이템 사라짐 (페이드 아웃)
            playTone(880, 0.15, 'sine', 0.1);
            break;
        case 'frozen':
            // 얼음 효과 (차가운 소리)
            playSequence([
                { freq: 1318.51, duration: 0.08, delay: 0, wave: 'triangle', vol: 0.2 },
                { freq: 1046.50, duration: 0.1, delay: 90, wave: 'triangle', vol: 0.15 },
            ]);
            break;
        case 'slowed':
            // 느려짐 효과 (처지는 소리)
            playTone(440, 0.2, 'sawtooth', 0.15);
            break;
    }
};

/**
 * Initializes the AudioContext if needed, resumes it on user interaction,
 * and triggers the sound generation logic.
 * @param type The type of sound to play.
 */
export const playSound = (type: SoundType) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if it's suspended (required by modern browsers' autoplay policies).
    // The promise-based resume() ensures sounds play reliably after the first user gesture.
    if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
            playSoundLogic(ctx, type);
        }).catch(e => console.error("AudioContext resume failed.", e));
    } else {
        playSoundLogic(ctx, type);
    }
};