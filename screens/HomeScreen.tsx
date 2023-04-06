//@ts-nocheck
import {
  View,
  Text,
  SafeAreaView,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Video, AVPlaybackStatus } from 'expo-av';
import placeholderVid from './video.mp4';
import * as ScreenOrientation from 'expo-screen-orientation';
import useCampaign from './components/useCampaign';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

const HomeScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const [isFullScreenLoading, setFullScreenLoading] = useState(false);
  const videoRef = useRef(null);

  const { currentAssetUrl } = useCampaign();
  // const channelId = useChannelId();

  const [dimensions, setDimensions] = useState({ window, screen });
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });
    return () => subscription?.remove();
  });

  //console.log('current asset url: ', currentAssetUrl);

  //turns to fullscreen
  const handleFullScreen = async () => {
    if (!videoRef || isFullScreenLoading) return;
    setFullScreenLoading(true);
    await videoRef.current.presentFullscreenPlayer();
    setFullScreenLoading(false);
  };

  //change screen rotation
  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  }

  //screen rotate
  try {
    changeScreenOrientation();
  } catch (err) {
    console.log(err);
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="bg-black flex-1">
          {!currentAssetUrl || currentAssetUrl.length === 0 ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={placeholderVid}
              resizeMode="contain"
              isLooping={true}
              useNativeControls={true}
              shouldPlay={true}
              onReadyForDisplay={handleFullScreen}
            />
          ) : currentAssetUrl.slice(-4) === '.mp4' ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={{
                uri: currentAssetUrl,
              }}
              resizeMode="contain"
              isLooping={true}
              //onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              useNativeControls={true}
              shouldPlay={true}
              onReadyForDisplay={handleFullScreen}
            />
          ) : (
            <Image
              style={{ width: dimensions.window.width, height: dimensions.window.height }}
              source={{
                uri: currentAssetUrl,
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  video: {
    height: 800,
  },
  image: {
    height: 800,
  },
});
export default HomeScreen;
