// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useCallback, useState } from 'react';
// TODO: Next PR should move move provider & hooks into the selector package
// and we want to make samples and composite both use from selector package.
import { useAzureCommunicationHandlers } from './hooks/useAzureCommunicationHandlers';
import { LocalDeviceSettings } from './LocalDeviceSettings';
import { StartCallButton } from './StartCallButton';
import { devicePermissionSelector } from './selectors/devicePermissionSelector';
import { OptionsButton, getCallingSelector, useSelector } from '@azure/communication-react';
import { titleContainerStyle } from './styles/ConfigurationScreen.styles';
import { Stack } from '@fluentui/react';
import { LocalPreview } from './LocalPreview';
import { configurationStackTokens, configurationContainer } from './styles/CallConfiguration.styles';

export interface ConfigurationScreenProps {
  startCallHandler(isMicOn: boolean): void;
}

const title = 'Start a call';

export const ConfigurationScreen = (props: ConfigurationScreenProps): JSX.Element => {
  const { startCallHandler } = props;

  const options = useSelector(getCallingSelector(OptionsButton));
  const localDeviceSettingsHandlers = useAzureCommunicationHandlers(LocalDeviceSettings);
  const { video: cameraPermissionGranted, audio: microphonePermissionGranted } = useSelector(devicePermissionSelector);

  const [isLocalMicrophoneEnabled, setIsLocalMicrophoneEnabled] = useState(false);

  const onToggleMic = useCallback(async () => {
    setIsLocalMicrophoneEnabled(!isLocalMicrophoneEnabled);
  }, [isLocalMicrophoneEnabled]);

  return (
    <Stack verticalAlign="center" className={configurationContainer}>
      <Stack horizontal wrap horizontalAlign="center" verticalAlign="center" tokens={configurationStackTokens}>
        <LocalPreview onToggleMic={onToggleMic} isMicOn={isLocalMicrophoneEnabled}/>
        <Stack>
          <div className={titleContainerStyle}>{title}</div>
          <LocalDeviceSettings
            {...options}
            {...localDeviceSettingsHandlers}
            cameraPermissionGranted={cameraPermissionGranted}
            microphonePermissionGranted={microphonePermissionGranted}
          />
          <div>
            <StartCallButton onClickHandler={() => startCallHandler(isLocalMicrophoneEnabled)} isDisabled={!microphonePermissionGranted} />
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};
