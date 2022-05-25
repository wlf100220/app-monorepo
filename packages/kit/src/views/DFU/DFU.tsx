import React, { useEffect, useState } from 'react';
import DocumentPicker from 'react-native-document-picker';
import { Box, ScrollView, useSafeAreaInsets, Typography, Button } from '@onekeyhq/components';
import deviceUtils, { BleDevice } from '@onekeyhq/kit/src/utils/ble/utils'
import { onekeyBleConnect } from '@onekeyhq/kit/src/utils/ble/BleOnekeyConnect';
import { NordicDFU, DFUEmitter } from "react-native-nordic-dfu";
import BleManager from 'react-native-ble-manager';

BleManager.start({ showAlert: false }).then(() => {
  // Success code
  console.log("Module initialized");
});

export const DFU = () => {
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(null);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [features, setFeatures] = useState<any>();
  const [uri, setUri] = useState('');
  const [progress, setProgress] = useState<any>();
  const [dfu, setDfu] = useState<any>();

  const inset = useSafeAreaInsets();

  const handleConnect = () => {
    setDevices([]);
    setTimeout(() => {
      deviceUtils?.startDeviceScan((_device) => {
        if (_device && _device.name?.startsWith('K')) {
          setDevices(prev => [...prev, _device]);
        }
      });
    }, 1000)
  }

  const handleDeviceConnect = async (id: string, device: BleDevice) => {
    setConnectedDevice(null)
    await deviceUtils?.stopScan();
    await deviceUtils?.connect(id, 'classic');
    setConnectedDevice(device);
    setDevices([]);
  }

  const handleFeatures = async () => {
    const features = await onekeyBleConnect.getFeatures(connectedDevice)

    setFeatures(features);
  }

  const handlePick = async () => {
    const url = await DocumentPicker.pick({ type: "public.archive" });
    setUri(url[0].uri);
  }

  const handleDFU = async () => {
    console.log({
      deviceAddress: connectedDevice?.id ?? '',
      filePath: uri,
      alternativeAdvertisingNameEnabled: false,
    });
    try {
      const resp = await NordicDFU.startDFU({
        deviceAddress: connectedDevice?.id ?? '',
        filePath: uri,
        alternativeAdvertisingNameEnabled: false,
      });
      console.log('----resp', resp);
    } catch (e) {
      console.log('-----e', e);
    }

  }

  useEffect(() => {
    DFUEmitter.addListener(
      "DFUProgress",
      ({ percent, currentPart, partsTotal, avgSpeed, speed }) => {
        setProgress({
          percent,
          currentPart,
          partsTotal,
          avgSpeed,
          speed
        });
      }
    );

    DFUEmitter.addListener("DFUStateChanged", ({ state }) => {
      setDfu(state);
    });
  }, []);

  return (
    <Box bg="background-default" flex="1">
      <ScrollView px={4} py={{ base: 6, md: 8 }} bg="background-default">
        <Box w="full" pb={inset.bottom}>
          <Typography.Body1>1. 连接 Touch</Typography.Body1>
          {
            devices.map(device => {
              return (
                <Button onPress={() => handleDeviceConnect(device.id, device)}>{device.name}</Button>
              )
            })
          }
          {
            connectedDevice ? <Typography.Body1>已连接：{connectedDevice.name}:{connectedDevice.id}</Typography.Body1> : null
          }
          <Typography.Body1>2. 确定能够读取设备信息</Typography.Body1>
          {
            features ? (
              <>
                <Typography.Body2>固件: {features.onekey_version}</Typography.Body2>
                <Typography.Body2>蓝牙固件: {features.ble_ver}</Typography.Body2>
                <Typography.Body2>UUID: {features.onekey_serial}</Typography.Body2>
              </>
            ) : null
          }
          <Typography.Body1>3. 选择蓝牙固件 .zip 结尾</Typography.Body1>
          {
            uri ? (
              <Typography.Body2>已选择: {uri}</Typography.Body2>
            ) : null
          }
          <Typography.Body1>4. 操作 DFU 更新蓝牙固件，注此处仅能通过蓝牙更新蓝牙固件</Typography.Body1>
          {
            progress ? (
              <>
                <Typography.Body2>percent: {progress.percent}</Typography.Body2>
                <Typography.Body2>currentPart: {progress.currentPart}</Typography.Body2>
                <Typography.Body2>partsTotal: {progress.partsTotal}</Typography.Body2>
                <Typography.Body2>avgSpeed: {progress.avgSpeed}</Typography.Body2>
                <Typography.Body2>speed: {progress.speed}</Typography.Body2>
              </>
            ) : null
          }
          {
            dfu ? (
              <>
                <Typography.Body2>dfu state: {dfu}</Typography.Body2>
              </>
            ) : null
          }
        </Box>

        <Button onPress={handleConnect}>连接 Touch</Button>
        <Button mt="2" onPress={handleFeatures}>读取硬件信息</Button>
        <Button mt="2" onPress={handlePick}>选择蓝牙固件 .zip</Button>
        <Button mt="2" onPress={handleDFU}>确认上述无误之后，点击 DFU 更新蓝牙固件</Button>
      </ScrollView>
    </Box>
  );
};

export default DFU;
