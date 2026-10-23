import { Asset } from 'expo-asset';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WeatherIconAssetPair } from '@/components/home-weather';
import { useReducedMotion } from '@/components/controls';

// animated-weather-artwork

interface AnimatedWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function AnimatedWeatherArtwork({
  assets,
  shadowOffset,
  size,
}: AnimatedWeatherArtworkProps) {
  const reducedMotion = useReducedMotion();
  const moduleId = reducedMotion ? assets.static : assets.animated;
  const asset = useMemo(() => Asset.fromModule(moduleId), [moduleId]);
  const [uri, setUri] = useState(asset.localUri ?? asset.uri);

  useEffect(() => {
    let mounted = true;
    setUri(asset.localUri ?? asset.uri);
    void asset.downloadAsync().then((downloaded) => {
      if (mounted) setUri(downloaded.localUri ?? downloaded.uri);
    });
    return () => {
      mounted = false;
    };
  }, [asset]);

  const html = useMemo(
    () =>
      `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{position:relative;margin:0;width:100%;height:100%;overflow:hidden;background:transparent}.art{position:absolute;top:0;left:0;width:${size}px;height:${size}px;object-fit:contain}.shadow{transform:translate(${shadowOffset}px,${shadowOffset}px);filter:grayscale(1) brightness(0)}</style></head><body><img class="art shadow" src="${escapeAttribute(uri)}" /><img class="art" src="${escapeAttribute(uri)}" /></body></html>`,
    [shadowOffset, size, uri],
  );

  return (
    <WebView
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      androidLayerType="hardware"
      bounces={false}
      cacheEnabled
      javaScriptEnabled
      originWhitelist={['*']}
      overScrollMode="never"
      pointerEvents="none"
      scrollEnabled={false}
      setSupportMultipleWindows={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      source={{ html }}
      style={styles.webView}
    />
  );
}

const styles = StyleSheet.create({ webView: { flex: 1, backgroundColor: 'transparent' } });
