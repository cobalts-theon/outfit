/**
 * Hiển thị hình thời tiết chuyển động trên điện thoại.
 * Chọn tài nguyên theo trạng thái thời tiết và tôn trọng tùy chọn giảm chuyển động.
 */
import { Asset } from 'expo-asset';
import { useEffect, useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import type { WeatherIconAssetPair } from '@/components/home-weather';
import { useReducedMotion } from '@/components/controls';
// Ctrl/Cmd + click để mở file chỉnh giao diện.
import { styles, weatherArtworkCss } from '@/css/components/animated-weather-artwork.styles';

// animated-weather-artwork

interface AnimatedWeatherArtworkProps {
  readonly assets: WeatherIconAssetPair;
  readonly shadowOffset: number;
  readonly size: number;
}

// Mã hóa ký tự trước khi chèn HTML.
function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Hiển thị hình thời tiết chuyển động.
export function AnimatedWeatherArtwork({ assets, shadowOffset, size }: AnimatedWeatherArtworkProps) {
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
      `<!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
            <style>${weatherArtworkCss(size, shadowOffset)}</style>
          </head>
          <body>
            <img class="art shadow" src="${escapeAttribute(uri)}" />
            <img class="art" src="${escapeAttribute(uri)}" />
          </body>
        </html>`,
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
