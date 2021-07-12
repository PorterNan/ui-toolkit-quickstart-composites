// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { mergeStyles, Spinner, SpinnerSize, Stack } from '@fluentui/react';
import React, { useEffect, useMemo } from 'react';
import {
  PlaceholderProps,
  StreamMedia,
  VideoGalleryLocalParticipant,
  VideoGalleryRemoteParticipant,
  VideoStreamOptions,
  VideoTile
} from '@azure/communication-react';
import {
  aspectRatioBoxContentStyle,
  aspectRatioBoxStyle,
  screenShareContainerStyle,
  stackContainerStyle
} from './styles/MediaGallery.styles';
import { loadingStyle, videoStreamStyle } from './styles/ScreenShare.styles';

export type ScreenShareProps = {
  screenShareParticipant: VideoGalleryRemoteParticipant | undefined;
  localParticipant?: VideoGalleryLocalParticipant;
  remoteParticipants: VideoGalleryRemoteParticipant[];
  onCreateLocalStreamView?: () => Promise<void>;
  onCreateRemoteStreamView?: (userId: string, options?: VideoStreamOptions) => Promise<void>;
};

// A non-undefined display name is needed for this render, and that is coming from VideoTile props below
const onRenderPlaceholder = (props: PlaceholderProps): JSX.Element => (
  <div className={loadingStyle}>
    <Spinner label={`Loading ${props.displayName}'s screen`} size={SpinnerSize.xSmall} />
  </div>
);

export const ScreenShare = (props: ScreenShareProps): JSX.Element => {
  const {
    screenShareParticipant,
    localParticipant,
    remoteParticipants,
    onCreateRemoteStreamView,
    onCreateLocalStreamView
  } = props;

  const localVideoStream = localParticipant?.videoStream;
  const isLocalVideoReady = localVideoStream?.renderElement !== undefined;
  const isScreenShareAvailable =
    screenShareParticipant &&
    screenShareParticipant.screenShareStream &&
    screenShareParticipant.screenShareStream.isAvailable;

  const screenShareStreamComponent = useMemo(() => {
    if (!isScreenShareAvailable) {
      return;
    }
    const screenShareStream = screenShareParticipant?.screenShareStream;
    const videoStream = screenShareParticipant?.videoStream;
    if (screenShareStream?.isAvailable && !screenShareStream?.renderElement) {
      screenShareParticipant &&
        onCreateRemoteStreamView &&
        onCreateRemoteStreamView(screenShareParticipant.userId, {
          scalingMode: 'Fit'
        });
    }
    if (videoStream?.isAvailable && !videoStream?.renderElement) {
      screenShareParticipant && onCreateRemoteStreamView && onCreateRemoteStreamView(screenShareParticipant.userId);
    }

    return (
      <VideoTile
        displayName={screenShareParticipant?.displayName}
        isVideoReady={screenShareStream?.isAvailable}
        isMuted={screenShareParticipant?.isMuted}
        renderElement={<StreamMedia videoStreamElement={screenShareStream?.renderElement ?? null} />}
        onRenderPlaceholder={onRenderPlaceholder}
        styles={{
          overlayContainer: videoStreamStyle
        }}
      >
        {videoStream && videoStream.isAvailable && videoStream.renderElement && (
          <Stack horizontalAlign="center" verticalAlign="center" className={aspectRatioBoxStyle}>
            <Stack className={aspectRatioBoxContentStyle}>
              <VideoTile
                isVideoReady={videoStream.isAvailable}
                renderElement={<StreamMedia videoStreamElement={videoStream.renderElement ?? null} />}
              />
            </Stack>
          </Stack>
        )}
      </VideoTile>
    );
  }, [isScreenShareAvailable, onCreateRemoteStreamView, screenShareParticipant]);

  const layoutLocalParticipant = useMemo(() => {
    if (localVideoStream && !localVideoStream?.renderElement) {
      onCreateLocalStreamView && onCreateLocalStreamView();
    }

    return (
      <VideoTile
        isVideoReady={isLocalVideoReady}
        isMuted={localParticipant?.isMuted}
        renderElement={<StreamMedia videoStreamElement={localVideoStream?.renderElement ?? null} />}
        displayName={localParticipant?.displayName}
      />
    );
  }, [isLocalVideoReady, localParticipant, localVideoStream, onCreateLocalStreamView]);

  const sidePanelRemoteParticipants = useMemo(() => {
    return remoteParticipants && screenShareParticipant
      ? remoteParticipants
        .filter((remoteParticipant: VideoGalleryRemoteParticipant) => {
          return remoteParticipant.userId !== screenShareParticipant.userId;
        })
        .map((participant: VideoGalleryRemoteParticipant) => {
          const remoteVideoStream = participant.videoStream;
          return <SidePanelRemoteParticipant key={participant.userId}
            userId={participant.userId}
            onCreateRemoteStreamView={onCreateRemoteStreamView}
            isStreamAvailable={remoteVideoStream?.isAvailable}
            renderElement={remoteVideoStream?.renderElement}
            displayName={participant.displayName}
            isMuted={participant.isMuted}
          />
        })
      : [];
  }, [remoteParticipants, onCreateRemoteStreamView, screenShareParticipant]);

  return (
    <>
      <div className={stackContainerStyle}>
        <Stack grow className={mergeStyles({ height: '100%', overflow: 'auto' })}>
          <Stack horizontalAlign="center" verticalAlign="center" className={aspectRatioBoxStyle}>
            <Stack className={aspectRatioBoxContentStyle}>{layoutLocalParticipant}</Stack>
          </Stack>
          {sidePanelRemoteParticipants}
        </Stack>
      </div>
      <div className={screenShareContainerStyle}>{screenShareStreamComponent}</div>
    </>
  );
};

const SidePanelRemoteParticipant = React.memo((props: {
  userId: string,
  isStreamAvailable?: boolean,
  isMuted?: boolean,
  renderElement?: HTMLElement,
  displayName?: string,
  onCreateRemoteStreamView?: (userId: string, options?: VideoStreamOptions) => Promise<void>;
  onDisposeRemoteStreamView?: (userId: string) => Promise<void>;

}) => {
  const { userId, isStreamAvailable, isMuted, renderElement, displayName, onDisposeRemoteStreamView, onCreateRemoteStreamView } = props;

  useEffect(() => {
    if (isStreamAvailable && !renderElement) {
      onCreateRemoteStreamView && onCreateRemoteStreamView(userId);
    }
    if (!isStreamAvailable) {
      onDisposeRemoteStreamView && onDisposeRemoteStreamView(userId);
    }
  }, [isStreamAvailable, onCreateRemoteStreamView, onDisposeRemoteStreamView, renderElement, userId]);


  useEffect(() => {
    return () => {
      onDisposeRemoteStreamView && onDisposeRemoteStreamView(userId);
    };
  }, [onDisposeRemoteStreamView, userId]);

  return (
    <Stack horizontalAlign="center" verticalAlign="center" className={aspectRatioBoxStyle} key={userId}>
      <Stack className={aspectRatioBoxContentStyle}>
        <VideoTile
          userId={userId}
          isVideoReady={isStreamAvailable}
          renderElement={<StreamMedia videoStreamElement={renderElement ?? null} />}
          displayName={displayName}
          isMuted={isMuted}
        />
      </Stack>
    </Stack>
  );
})