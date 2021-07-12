// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Spinner, Stack } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  activeContainerClassName,
  containerStyles,
  callControlsStyles,
  subContainerStyles,
  callControlsContainer
} from './styles/CallScreen.styles';

import { MediaGallery } from './MediaGallery';
import { isInCall } from '../../utils/SDKUtils';
import { complianceBannerSelector } from './selectors/complianceBannerSelector';
import { getCall } from './selectors/baseSelectors';
import { callStatusSelector } from './selectors/callStatusSelector';
import { mediaGallerySelector } from './selectors/mediaGallerySelector';
import { PlaceholderProps, VideoStreamOptions, useSelector, CallCompositePage, useCallAgent, useCallClient, useCall } from '@azure/communication-react';
import { TeamsMeetingLinkLocator, GroupCallLocator, Call, AudioOptions } from '@azure/communication-calling';
import { CallControls } from './CallControls';
import { ComplianceBanner } from './ComplianceBanner';
import { lobbySelector } from './selectors/lobbySelector';
import { Lobby } from './Lobby';
import { PermissionsBanner } from '../common/PermissionsBanner';
import { permissionsBannerContainerStyle } from '../common/styles/PermissionsBanner.styles';
import { devicePermissionSelector } from './selectors/devicePermissionSelector';
import { ScreenSharePopup } from './ScreenSharePopup';
import { useAzureCommunicationHandlers } from './hooks/useAzureCommunicationHandlers';

export interface CallScreenProps {
  callInvitationURL?: string;
  showParticipants?: boolean;
  endCallHandler(): void;
  callErrorHandler(customPage?: CallCompositePage): void;
  onRenderAvatar?: (props: PlaceholderProps, defaultOnRender: (props: PlaceholderProps) => JSX.Element) => JSX.Element;
  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;
  isMicOn: boolean;
};

const spinnerLabel = 'Initializing call client...';

export const CallScreen = (props: CallScreenProps): JSX.Element => {
  const { callInvitationURL, showParticipants, endCallHandler, isMicOn, onRenderAvatar, callLocator } = props;

  // To use useProps to get these states, we need to create another file wrapping Call,
  // It seems unnecessary in this case, so we get the updated states using this approach.
  const { callStatus, isScreenShareOn } = useSelector(callStatusSelector);
  const callState = useSelector(getCall);

  const screenShareHandlers = useAzureCommunicationHandlers(ScreenSharePopup);
  
  const call = useCall();
  const currentCallId = useRef('');
  if (call) {
    currentCallId.current = call.id;
  }

  const mediaGalleryProps = useSelector(mediaGallerySelector);
  const mediaGalleryHandlers = useAzureCommunicationHandlers(MediaGallery);
  const complianceBannerProps = useSelector(complianceBannerSelector);

  const lobbyProps = useSelector(lobbySelector);
  const lobbyHandlers = useAzureCommunicationHandlers(Lobby);

  const devicePermissions = useSelector(devicePermissionSelector);

  const localVideoViewOption = {
    scalingMode: 'Crop',
    isMirrored: true
  } as VideoStreamOptions;

  if ('meetingLink' in callLocator) {
    const callStatus = callState?.state;
    if (
      callStatus !== undefined &&
      call &&
      ['Connecting', 'Ringing', 'InLobby'].includes(callStatus)
    ) {
      return (
        <Lobby
          callState={callStatus}
          {...lobbyProps}
          {...lobbyHandlers}
          onEndCallClick={endCallHandler}
          isMicrophoneChecked={isMicOn}
          localVideoViewOption={localVideoViewOption}
        />
      );
    }
  }

  return (
    <Stack horizontalAlign="center" verticalAlign="center" styles={containerStyles} grow>
      {isInCall(callStatus ?? 'None') ? (
        <>
          <Stack.Item style={{ width: '100%' }}>
            <ComplianceBanner {...complianceBannerProps} />
          </Stack.Item>
          <Stack.Item style={permissionsBannerContainerStyle}>
            <PermissionsBanner
              microphonePermissionGranted={devicePermissions.audio}
              cameraPermissionGranted={devicePermissions.video}
            />
          </Stack.Item>
          <Stack.Item styles={subContainerStyles} grow>
            {callStatus === 'Connected' && (
              <>
                <Stack styles={containerStyles} grow>
                  <Stack.Item grow styles={activeContainerClassName}>
                    <MediaGallery {...mediaGalleryProps} {...mediaGalleryHandlers} onRenderAvatar={onRenderAvatar} />
                  </Stack.Item>
                </Stack>
                {isScreenShareOn ? (
                  <ScreenSharePopup
                    {...screenShareHandlers}
                  />
                ) : (
                  <></>
                )}
              </>
            )}
          </Stack.Item>
          <Stack.Item styles={callControlsStyles}>
            <Stack className={callControlsContainer}>
              <CallControls
                onEndCallClick={endCallHandler}
                showParticipants={showParticipants}
                callInvitationURL={callInvitationURL}
              />
            </Stack>
          </Stack.Item>
        </>
      ) : (
        <Spinner label={spinnerLabel} ariaLive="assertive" labelPosition="top" />
      )}
    </Stack>
  );
};
