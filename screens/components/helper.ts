import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';

import * as Device from 'expo-device';
import { gqlclient } from '../gql';

export const asyncListAllFiles = async () => {
  let dir = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
  //console.log(dir);
  return dir;
};

export const asyncReadFile = async (uriValue: string) => {
  if (!uriValue) return;
  try {
    const bin = await FileSystem.readAsStringAsync(uriValue);
    return bin;
  } catch (err) {
    console.log(err);
  }
};

export const getUri = (fileName: string) => {
  return FileSystem.documentDirectory + fileName;
};

export const asyncReadAllFiles = async () => {
  const files: string[] = await asyncListAllFiles();
  let array = [];
  //console.log(FileSystem.documentDirectory + files[1]);

  for (let i = 0; i < files.length; i++) {
    const bin = await asyncReadFile(FileSystem.documentDirectory + files[i]);
    array.push(bin);
  }
  //console.log(array);

  return array;
};

export const asyncGetFileInfo = async (uriValue: string) => {
  if (!uriValue) return;
  try {
    const fileInfo = await FileSystem.getInfoAsync(uriValue);
    return fileInfo;
  } catch (err) {
    console.log(err);
  }
};

export const asyncGetFreeDisk = async () => {
  try {
    FileSystem.getFreeDiskStorageAsync().then((freeDisk) => {
      //console.log(freeDisk);
      return freeDisk;
    });
  } catch (err) {
    console.log(err);
  }
};

export const asyncDownload = async (url: string, fileName: string) => {
  FileSystem.downloadAsync(url, FileSystem.documentDirectory + fileName)
    .then(({ uri }) => {
      console.log('Finished downloading to ', uri);
      return uri;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const deleteAsync = async (fileUri: string, options = {}) => {
  await FileSystem.deleteAsync(fileUri, options);
};

export const deleteAllFiles = async () => {
  let dir = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
  console.log('FOUND:', dir);
  for (const item of dir) {
    if (item === 'channelId.txt' || item === 'placeholder.mp4') {
      continue;
    }
    console.log('DELETING', item);
    const uri = getUri(item);
    await deleteAsync(uri);
  }
};

export const asyncWriteStringToFile = async (input: string, fileName: string) => {
  const fileUri = getUri(fileName);
  await FileSystem.writeAsStringAsync(fileUri, input, { encoding: FileSystem.EncodingType.UTF8 });
};

export const queryfy: any = (obj: any) => {
  // Make sure we don't alter integers.
  if (obj === null) {
    return null;
  }
  if (typeof obj === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const props = obj.map((value) => `${queryfy(value)}`).join(',');
    return `[${props}]`;
  }

  if (typeof obj === 'object') {
    const props = Object.keys(obj)
      .map((key) => {
        const string = `${key}:${queryfy(obj[key])}`;
        if (queryfy(obj[key]) === null) {
          return;
        }
        return string;
      })
      .join(',');
    return `{${props}}`;
  }

  return JSON.stringify(obj);
};

export const findOrGenerateChannelId = async () => {
  console.log('checking for channel id availibility..');
  let fileList = await asyncListAllFiles();
  if (fileList.includes('channelId.txt')) {
    const channelId = await asyncReadFile(getUri('channelId.txt'));

    return channelId;
  } else {
    console.log('generating new uuid/channelId...');
    const channelId = String(uuid.v4());
    await asyncWriteStringToFile(channelId, 'channelId.txt');
    const deviceCredentials = getDeviceCredentials();
    return await asyncReadFile(getUri('channelId.txt'));
  }
};

export const getDeviceCredentials = () => {
  console.log('getting devices credentials..');
  return {
    brand: Device.brand,
    designName: Device.designName,
    deviceName: Device.deviceName,
    deviceYearClass: Device.deviceYearClass,
    isDevice: Device.isDevice,
    manufacturer: Device.manufacturer,
    modelId: Device.modelId,
    modelName: Device.modelName,
    osBuildFingerprint: Device.osBuildFingerprint,
    osBuildId: Device.osBuildId,
    osInternalBuildId: Device.osInternalBuildId,
    osName: Device.osName,
    osVersion: Device.osVersion,
    platformApiLevel: Device.platformApiLevel,
    productName: Device.productName,
    supportedCpuArchitectures: Device.supportedCpuArchitectures,
    totalMemory: Device.totalMemory,
  };
};

export const getChannelCredentials = async () => {
  console.log('getting channels credentials..');
  return {
    channelName: 'tablet: ' + getDeviceCredentials().deviceName,
    channelId: await findOrGenerateChannelId(),
    resolution: 'res: ' + getDeviceCredentials().modelName,
    deviceCredentials: getDeviceCredentials(),
    channelType: 'taxi',
  };
};

export const registerToDatabase = async () => {
  const fields = await getChannelCredentials();
  console.log('registering to database..');
  const REGISTER_CHANNEL = `
  mutation {
    registerChannel(args: ${queryfy(fields)}
    ){
      channelName
      _id
    }
  }
  `;

  const registerChannel = await gqlclient.request(REGISTER_CHANNEL);
};
