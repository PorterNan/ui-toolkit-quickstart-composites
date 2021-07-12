// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { VideoOff20Filled } from '@fluentui/react-icons';
import { Stack, Text } from '@fluentui/react';
import { localPreviewContainerStyle, cameraOffLabelStyle, localPreviewTileStyle } from './styles/LocalPreview.styles';
import { StreamMedia, VideoTile, MicrophoneButton, ControlBar, CameraButton, usePropsFor, useSelector } from '@azure/communication-react';
import { localPreviewSelector } from './selectors/localPreviewSelector';
import { devicePermissionSelector } from './selectors/devicePermissionSelector';

const onRenderPlaceholder = (): JSX.Element => {
  return (
    <Stack style={{ width: '100%', height: '100%' }} verticalAlign="center">
      <Stack.Item align="center">
        <VideoOff20Filled primaryFill="currentColor" />
      </Stack.Item>
      <Stack.Item align="center">
        <Text className={cameraOffLabelStyle}>Your camera is turned off.</Text>
      </Stack.Item>
    </Stack>
  );
};

export type LocalPreviewProps = {
  isMicOn: boolean;
  onToggleMic: () => Promise<void>;
} 

export const LocalPreview = (props: LocalPreviewProps): JSX.Element => {
  const cameraButtonProps = usePropsFor(CameraButton);
  const localPreviewProps = useSelector(localPreviewSelector);
  const { audio: microphonePermissionGranted, video: cameraPermissionGranted } = useSelector(devicePermissionSelector);

  return (
    <Stack className={localPreviewContainerStyle}>
      <VideoTile
        styles={localPreviewTileStyle}
        isVideoReady={!!localPreviewProps.videoStreamElement}
        renderElement={<StreamMedia videoStreamElement={localPreviewProps.videoStreamElement} />}
        onRenderPlaceholder={onRenderPlaceholder}
      >
        <ControlBar layout="floatingBottom">
          <CameraButton {...cameraButtonProps} showLabel={true} disabled={!cameraPermissionGranted} />
          <MicrophoneButton
            checked={props.isMicOn}
            onToggleMicrophone={props.onToggleMic}
            disabled={!microphonePermissionGranted}
            showLabel={true}
          />
        </ControlBar>
      </VideoTile>
    </Stack>
  );
};
