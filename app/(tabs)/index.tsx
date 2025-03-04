declare module 'react-native-image-to-pdf';

import { Image, StyleSheet, Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const isJSON = (item: any) => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }
  if(typeof item === 'object' && item !== null) {
    return true;
  }
  return false;
};

const cxmpdfDownload = async (data: any, action: string) => {
  const path = `${FileSystem.documentDirectory}/wp`;
  let basedata = data.pdf;
  let fileName = data.fileName;
  let foldername = data.folderName;
  console.log("cxmpdfdownload data", basedata);
  console.log("cxmpdfdownload foldername", foldername);
  console.log("cxmpdfdownload filename", fileName);

  const downloadPath = `${path}/download/${foldername}`;
  const readyToUploadPath = `${path}/readyToUpload`;
  const redlinePath = `${path}/redline`;

  // Create directories if they don't exist
  try {
    await FileSystem.makeDirectoryAsync(downloadPath, { intermediates: true });
    await FileSystem.makeDirectoryAsync(readyToUploadPath, { intermediates: true });
    await FileSystem.makeDirectoryAsync(redlinePath, { intermediates: true });

    if (action === "PDFDOWNLOAD") {
      await FileSystem.writeAsStringAsync(
        `${downloadPath}/${fileName}`, 
        basedata, 
        { encoding: FileSystem.EncodingType.Base64 }
      );
      return `${downloadPath}/${fileName}`;
    }
    else if (action === "PDFDELETE") {
      const filePaths = [
        `${downloadPath}/${fileName}`,
        `${redlinePath}/${fileName}`,
        `${readyToUploadPath}/${fileName}`
      ];

      for (const filePath of filePaths) {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(filePath);
          // StandaloneOmegaUtil.sendUpdatesToWP(filePath, fileName);
          return filePath;
        }
      }
    }
  } catch (error) {
    console.error('File operation error:', error);
    throw error;
  }
};

export default function HomeScreen() {
  const handleWebViewMessage = async (event: any) => {
    try {
      const { data } = event.nativeEvent;
      console.log(data);
      if (isJSON(data)) {
        let jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
        let jsonObj = JSON.parse(jsonStr);
        let action = jsonObj["action"];
        let dataObj = jsonObj["data"];

        if (action === "PDFDOWNLOAD") {
          // dataObj is already in the correct format from your web app
          // No need to create a new object
          const pdfPath = await cxmpdfDownload(dataObj, action);
          
          if (pdfPath) {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(pdfPath, {
                mimeType: 'application/pdf',
                dialogTitle: 'Download PDF',
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Embedding WebView for the React app */}
      <View style={styles.webviewContainer}>
        <ThemedText type="subtitle">App rendering a react web app</ThemedText>
        <WebView 
          source={{ uri: 'https://native-liart.vercel.app/' }} 
          style={styles.webview}
          onMessage={handleWebViewMessage}
        />
      </View>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it </ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  webviewContainer: {
    height: 400, // Adjust height for WebView
    width: '100%',
    marginVertical: 10,
  },
  webview: {
    flex: 1,
  },
});
