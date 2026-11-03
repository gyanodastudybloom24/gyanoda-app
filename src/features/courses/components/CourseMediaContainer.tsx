import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Rounded } from '@/constants/theme';

export interface CourseMediaContainerProps {
  imageUrl: string;
  videoUrl?: string;
}

/**
 * CourseMediaContainer
 * 16:12 ratio media container placed at the top of the Course Details screen.
 * Currently displays the preview image, structured to seamlessly drop in a video player.
 */
export function CourseMediaContainer({
  imageUrl,
  videoUrl: _videoUrl,
}: CourseMediaContainerProps) {
  return (
    <View style={styles.mediaContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.mediaImage}
        contentFit="cover"
        transition={300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: '100%',
    aspectRatio: 16 / 12,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: Rounded.card,
    borderBottomRightRadius: Rounded.card,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: Rounded.card,
    borderBottomRightRadius: Rounded.card,
  },
});

