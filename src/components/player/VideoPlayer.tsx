import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SolarIcon } from '@/components/icons';
import { Palette, Spacing } from '@/constants/theme';

export interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onBack?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const DEFAULT_VIDEO_URL = 'https://vjs.zencdn.net/v/oceans.mp4';

const SPEED_OPTIONS = [
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: 'Normal (1.0x)', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '1.75x', value: 1.75 },
  { label: '2.0x', value: 2.0 },
];

const QUALITY_OPTIONS = [
  { label: 'Auto (Recommended)', value: 'Auto (720p)' },
  { label: 'Higher picture quality (1080p)', value: '1080p' },
  { label: 'Standard (720p)', value: '720p' },
  { label: 'Data saver (480p)', value: '480p' },
  { label: 'Low bandwidth (360p)', value: '360p' },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  const h = Math.floor(m / 60);
  const displayM = m % 60;
  if (h > 0) {
    return `${h}:${displayM < 10 ? '0' : ''}${displayM}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${displayM}:${s < 10 ? '0' : ''}${s}`;
}

export function VideoPlayer({
  videoUrl,
  title,
  onBack,
  isFullscreen = false,
  onToggleFullscreen,
  autoPlay = true,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: VideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const effectiveUrl = videoUrl || DEFAULT_VIDEO_URL;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<'forward' | 'backward' | null>(null);

  // Settings sheet states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'speed' | 'quality'>('main');
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('Auto (720p)');

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);
  const progressBarWidthRef = useRef<number>(0);

  // Animated scale values for YouTube-style double-tap ripple feedback
  const forwardScale = useSharedValue(1);
  const backwardScale = useSharedValue(1);

  const player = useVideoPlayer(effectiveUrl, (p) => {
    p.loop = true;
    p.muted = false;
    if (autoPlay) {
      try {
        p.play();
      } catch {
        // Handled gracefully
      }
    }
  });

  // Controls auto-hide timer (disappears after 3.5 seconds of playback)
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (player.playing && !isSettingsOpen) {
        setAreControlsVisible(false);
      }
    }, 3500);
  };
  const resetControlsTimeoutRef = useRef(resetControlsTimeout);
  useEffect(() => {
    resetControlsTimeoutRef.current = resetControlsTimeout;
  });

  // Track playback time, buffering, and lifecycle events
  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', (event) => {
      setCurrentTime(event.currentTime);
      if (event.currentTime > 0) {
        setIsLoading(false);
      }
      if (player.duration && player.duration > 0) {
        setDuration(player.duration);
      }
    });

    const playSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
      if (event.isPlaying) {
        setIsLoading(false);
        resetControlsTimeoutRef.current();
      }
    });

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') {
        setIsLoading(false);
        if (player.duration) {
          setDuration(player.duration);
        }
        if (autoPlay) {
          try {
            player.play();
          } catch {
            // Handled gracefully
          }
        }
      } else if (event.status === 'loading') {
        setIsLoading(true);
      } else if (event.status === 'error') {
        setIsLoading(false);
      }
    });

    const sourceSub = player.addListener('sourceLoad', (event) => {
      if (event.duration > 0) {
        setDuration(event.duration);
      }
      setIsLoading(false);
      if (autoPlay) {
        try {
          player.play();
        } catch {
          // Handled gracefully
        }
      }
    });

    const sourceChangeSub = player.addListener('sourceChange', () => {
      setCurrentTime(0);
      setIsLoading(true);
      if (autoPlay) {
        try {
          player.play();
        } catch {
          // Handled gracefully
        }
      }
    });

    const rateSub = player.addListener('playbackRateChange', (event) => {
      setPlaybackRate(event.playbackRate);
    });

    return () => {
      timeSub.remove();
      playSub.remove();
      statusSub.remove();
      sourceSub.remove();
      sourceChangeSub.remove();
      rateSub.remove();
    };
  }, [player, autoPlay]);

  useEffect(() => {
    if (areControlsVisible && isPlaying && !isSettingsOpen) {
      resetControlsTimeoutRef.current();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [areControlsVisible, isPlaying, isSettingsOpen]);

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (seekFeedbackTimeoutRef.current) clearTimeout(seekFeedbackTimeoutRef.current);
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying || player.playing) {
      player.pause();
      setIsPlaying(false);
      setAreControlsVisible(true);
    } else {
      player.play();
      setIsPlaying(true);
      setIsLoading(false);
      resetControlsTimeout();
    }
  };

  const handleSeekBy = (seconds: number) => {
    try {
      player.seekBy(seconds);
    } catch {
      player.currentTime = Math.max(0, Math.min(currentTime + seconds, duration));
    }
    resetControlsTimeout();
  };

  // YouTube-style tap handling:
  // - Single tap: toggles player controls overlay (debounced to avoid accidental double-tap triggering)
  // - Double tap: seeks +/- 10s and displays transient animated 10s indicator, then auto-disappears
  const handleSideTap = (side: 'left' | 'right') => {
    const now = Date.now();
    const last = lastTapRef.current;

    if (last && now - last.time < 320 && last.side === side) {
      // Confirmed Double Tap! Cancel pending single-tap toggle
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      lastTapRef.current = null;

      if (side === 'left') {
        handleSeekBy(-10);
        setSeekFeedback('backward');
        backwardScale.value = withSequence(
          withSpring(1.25, { damping: 10 }),
          withTiming(1, { duration: 200 })
        );
      } else {
        handleSeekBy(10);
        setSeekFeedback('forward');
        forwardScale.value = withSequence(
          withSpring(1.25, { damping: 10 }),
          withTiming(1, { duration: 200 })
        );
      }

      // Auto-hide the 10-second indicator after 750ms
      if (seekFeedbackTimeoutRef.current) {
        clearTimeout(seekFeedbackTimeoutRef.current);
      }
      seekFeedbackTimeoutRef.current = setTimeout(() => {
        setSeekFeedback(null);
        seekFeedbackTimeoutRef.current = null;
      }, 750);
    } else {
      // First tap detected: buffer it and wait briefly for a possible second tap
      lastTapRef.current = { time: now, side };
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
      }
      singleTapTimeoutRef.current = setTimeout(() => {
        // Confirmed Single Tap: toggle controls visibility
        setAreControlsVisible((prev) => {
          const next = !prev;
          if (next && isPlaying) {
            resetControlsTimeout();
          }
          return next;
        });
        singleTapTimeoutRef.current = null;
        lastTapRef.current = null;
      }, 280);
    }
  };

  // Settings handlers
  const handleOpenSettings = () => {
    setSettingsSubmenu('main');
    setIsSettingsOpen(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setSettingsSubmenu('main');
    if (isPlaying) {
      resetControlsTimeout();
    }
  };

  const handleSelectSpeed = (speed: number) => {
    try {
      player.playbackRate = speed;
    } catch {
      // Handled gracefully
    }
    setPlaybackRate(speed);
    setIsSettingsOpen(false);
    setSettingsSubmenu('main');
    if (isPlaying) {
      resetControlsTimeout();
    }
  };

  const handleSelectQuality = (quality: string) => {
    setSelectedQuality(quality);
    setIsSettingsOpen(false);
    setSettingsSubmenu('main');
    if (isPlaying) {
      resetControlsTimeout();
    }
  };

  // Scrubber interactive seek
  const handleProgressBarLayout = (e: LayoutChangeEvent) => {
    progressBarWidthRef.current = e.nativeEvent.layout.width;
  };

  const handleProgressBarTouch = (e: GestureResponderEvent) => {
    if (progressBarWidthRef.current <= 0 || duration <= 0) return;
    const touchX = e.nativeEvent.locationX;
    const progress = Math.max(0, Math.min(touchX / progressBarWidthRef.current, 1));
    const targetSeconds = progress * duration;
    player.currentTime = targetSeconds;
    setCurrentTime(targetSeconds);
    resetControlsTimeout();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const animatedForwardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: forwardScale.value }],
  }));

  const animatedBackwardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backwardScale.value }],
  }));

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      {/* Underlying Native Video Player View */}
      <VideoView
        player={player}
        style={styles.videoView}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Tap Areas for Single-Tap controls toggle & Double-Tap 10s Seek */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.tapRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Rewind 10 seconds or toggle controls"
            onPress={() => handleSideTap('left')}
            style={styles.tapHalf}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fast forward 10 seconds or toggle controls"
            onPress={() => handleSideTap('right')}
            style={styles.tapHalf}
          />
        </View>
      </View>

      {/* Double-Tap 10s Seek Overlay: Backward (-10s) */}
      {seekFeedback === 'backward' && (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(200)}
          style={[styles.seekRippleLeft, animatedBackwardStyle]}
          pointerEvents="none">
          <SolarIcon name="Rewind10SecondsBack" type="bold" size={36} color="#ffffff" />
          <Text style={styles.seekFeedbackText}>10 seconds</Text>
        </Animated.View>
      )}

      {/* Double-Tap 10s Seek Overlay: Forward (+10s) */}
      {seekFeedback === 'forward' && (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(200)}
          style={[styles.seekRippleRight, animatedForwardStyle]}
          pointerEvents="none">
          <SolarIcon name="Rewind10SecondsForward" type="bold" size={36} color="#ffffff" />
          <Text style={styles.seekFeedbackText}>10 seconds</Text>
        </Animated.View>
      )}

      {/* Custom YouTube Overlay Controls */}
      {areControlsVisible && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.controlsOverlay,
            isFullscreen && {
              paddingLeft: Math.max(Spacing.three, insets.left),
              paddingRight: Math.max(Spacing.three, insets.right),
              paddingBottom: Math.max(Spacing.two, insets.bottom),
            },
          ]}>
          {/* Top Control Bar:
              - Left side: Back button (+ Question text in landscape mode)
              - Right side: Settings button (Playback speed & Quality)
          */}
          <View style={styles.topControls}>
            <View style={styles.topLeftControls}>
              {onBack && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={onBack}
                  hitSlop={8}
                  style={styles.iconButton}>
                  <SolarIcon name="ArrowLeft" type="linear" size={22} color="#ffffff" />
                </Pressable>
              )}

              {isFullscreen && title ? (
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
            </View>

            {/* Settings button on top right */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Playback speed and quality settings"
              onPress={handleOpenSettings}
              hitSlop={8}
              style={styles.iconButton}>
              <SolarIcon name="Settings" type="linear" size={20} color="#ffffff" />
            </Pressable>
          </View>

          {/* Center Playback Controls: Previous Video, Play/Pause, Next Video */}
          <View style={styles.centerControls}>
            {/* Previous Video Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous video"
              disabled={!hasPrevious}
              onPress={onPrevious}
              hitSlop={10}
              style={[
                styles.secondaryCenterButton,
                !hasPrevious && styles.disabledCenterButton,
              ]}>
              <SolarIcon
                name="SkipPrevious"
                type="bold"
                size={26}
                color={hasPrevious ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'}
              />
            </Pressable>

            {/* Play / Pause button or Buffering Spinner */}
            {isLoading ? (
              <View style={styles.playButtonCircle}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                onPress={togglePlayPause}
                style={styles.playButtonCircle}>
                <SolarIcon
                  name={isPlaying ? 'Pause' : 'Play'}
                  type="bold"
                  size={32}
                  color="#ffffff"
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              </Pressable>
            )}

            {/* Next Video Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next video"
              disabled={!hasNext}
              onPress={onNext}
              hitSlop={10}
              style={[
                styles.secondaryCenterButton,
                !hasNext && styles.disabledCenterButton,
              ]}>
              <SolarIcon
                name="SkipNext"
                type="bold"
                size={26}
                color={hasNext ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'}
              />
            </Pressable>
          </View>

          {/* Bottom Controls: Scrubber, Time Display, Fullscreen Button */}
          <View style={styles.bottomControls}>
            {/* Interactive Progress Bar */}
            <Pressable
              accessibilityRole="progressbar"
              accessibilityLabel={`Playback progress: ${Math.round(progressPercent)}%`}
              onLayout={handleProgressBarLayout}
              onPress={handleProgressBarTouch}
              style={styles.progressBarWrapper}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
                <View
                  style={[
                    styles.progressThumb,
                    { left: `${progressPercent}%` },
                  ]}
                />
              </View>
            </Pressable>

            {/* Time readout & Fullscreen button row */}
            <View style={styles.bottomMetaRow}>
              <Text style={styles.timeText}>
                {`${formatTime(currentTime)} / ${formatTime(duration)}`}
              </Text>

              {onToggleFullscreen && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  onPress={onToggleFullscreen}
                  hitSlop={8}
                  style={styles.fullscreenButton}>
                  <SolarIcon
                    name={isFullscreen ? 'Minimize' : 'Maximize'}
                    type="bold"
                    size={20}
                    color="#ffffff"
                  />
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      )}

      {/* YouTube-Style Settings Modal (Speed & Quality Controls) */}
      <Modal
        visible={isSettingsOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSettings}
        statusBarTranslucent={true}>
        <Pressable style={styles.modalBackdrop} onPress={handleCloseSettings}>
          <Pressable
            style={[
              styles.settingsSheet,
              isFullscreen && styles.settingsSheetLandscape,
            ]}
            onPress={(e) => e.stopPropagation()}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* 1. Main Settings Menu */}
            {settingsSubmenu === 'main' && (
              <View>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetHeaderTitle}>Playback Settings</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close settings"
                    onPress={handleCloseSettings}
                    hitSlop={8}>
                    <SolarIcon name="CloseCircle" type="linear" size={20} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                </View>

                {/* Playback Speed Row */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change playback speed"
                  onPress={() => setSettingsSubmenu('speed')}
                  style={styles.sheetMenuItem}>
                  <View style={styles.sheetMenuItemLeft}>
                    <SolarIcon name="PlaybackSpeed" type="bold" size={22} color={Palette.accent} />
                    <View>
                      <Text style={styles.sheetItemTitle}>Playback speed</Text>
                      <Text style={styles.sheetItemSubtitle}>
                        {playbackRate === 1.0 ? 'Normal' : `${playbackRate}x`}
                      </Text>
                    </View>
                  </View>
                  <SolarIcon name="AltArrowRight" type="linear" size={16} color="rgba(255,255,255,0.5)" />
                </Pressable>

                {/* Quality Row */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change video quality"
                  onPress={() => setSettingsSubmenu('quality')}
                  style={styles.sheetMenuItem}>
                  <View style={styles.sheetMenuItemLeft}>
                    <SolarIcon name="VideoFrame" type="bold" size={22} color={Palette.brand.primary} />
                    <View>
                      <Text style={styles.sheetItemTitle}>Quality</Text>
                      <Text style={styles.sheetItemSubtitle}>{selectedQuality}</Text>
                    </View>
                  </View>
                  <SolarIcon name="AltArrowRight" type="linear" size={16} color="rgba(255,255,255,0.5)" />
                </Pressable>
              </View>
            )}

            {/* 2. Playback Speed Sub-menu */}
            {settingsSubmenu === 'speed' && (
              <View>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderLeft}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Back to main settings"
                      onPress={() => setSettingsSubmenu('main')}
                      hitSlop={8}>
                      <SolarIcon name="AltArrowLeft" type="linear" size={20} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.sheetHeaderTitle}>Playback speed</Text>
                  </View>
                </View>

                <ScrollView style={styles.sheetScrollList} showsVerticalScrollIndicator={false}>
                  {SPEED_OPTIONS.map((item) => {
                    const isSelected = playbackRate === item.value;
                    return (
                      <Pressable
                        key={item.label}
                        accessibilityRole="button"
                        accessibilityLabel={`Speed ${item.label}`}
                        onPress={() => handleSelectSpeed(item.value)}
                        style={[styles.sheetOptionRow, isSelected && styles.sheetOptionActive]}>
                        <Text style={[styles.sheetOptionText, isSelected && styles.sheetOptionTextActive]}>
                          {item.label}
                        </Text>
                        {isSelected && (
                          <SolarIcon name="CheckCircle" type="bold" size={18} color={Palette.accent} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 3. Video Quality Sub-menu */}
            {settingsSubmenu === 'quality' && (
              <View>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderLeft}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Back to main settings"
                      onPress={() => setSettingsSubmenu('main')}
                      hitSlop={8}>
                      <SolarIcon name="AltArrowLeft" type="linear" size={20} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.sheetHeaderTitle}>Quality for current video</Text>
                  </View>
                </View>

                <ScrollView style={styles.sheetScrollList} showsVerticalScrollIndicator={false}>
                  {QUALITY_OPTIONS.map((item) => {
                    const isSelected = selectedQuality === item.value;
                    return (
                      <Pressable
                        key={item.label}
                        accessibilityRole="button"
                        accessibilityLabel={`Quality ${item.label}`}
                        onPress={() => handleSelectQuality(item.value)}
                        style={[styles.sheetOptionRow, isSelected && styles.sheetOptionActive]}>
                        <Text style={[styles.sheetOptionText, isSelected && styles.sheetOptionTextActive]}>
                          {item.label}
                        </Text>
                        {isSelected && (
                          <SolarIcon name="CheckCircle" type="bold" size={18} color={Palette.accent} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenContainer: {
    width: '100%',
    height: '100%',
    aspectRatio: undefined,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  tapRow: {
    flex: 1,
    flexDirection: 'row',
  },
  tapHalf: {
    flex: 1,
    height: '100%',
  },
  seekRippleLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    borderTopRightRadius: 180,
    borderBottomRightRadius: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 30,
  },
  seekRippleRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    borderTopLeftRadius: 180,
    borderBottomLeftRadius: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 30,
  },
  seekFeedbackText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'space-between',
    padding: Spacing.three,
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  topLeftControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  secondaryCenterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCenterButton: {
    opacity: 0.4,
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    gap: 6,
  },
  progressBarWrapper: {
    height: 20,
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.accent,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    marginLeft: -7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bottomMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  fullscreenButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Settings Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  settingsSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 500,
  },
  settingsSheetLandscape: {
    borderRadius: 24,
    marginVertical: 'auto',
    alignSelf: 'center',
    paddingBottom: 24,
    width: 420,
    maxWidth: '90%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 6,
  },
  sheetHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetItemTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  sheetItemSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  sheetScrollList: {
    maxHeight: 280,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 1,
  },
  sheetOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetOptionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  sheetOptionTextActive: {
    color: Palette.accent,
    fontWeight: '700',
  },
});
