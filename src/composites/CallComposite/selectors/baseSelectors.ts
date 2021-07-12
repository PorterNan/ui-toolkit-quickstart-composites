// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CallState as SDKCallStatus } from '@azure/communication-calling';
import { CallClientState, CallingBaseSelectorProps, CallState, DeviceManagerState, toFlatCommunicationIdentifier } from '@azure/communication-react';

export const getCall = (state: CallClientState, props: CallingBaseSelectorProps): CallState | undefined => state.calls[props.callId];
export const getCallStatus = (state: CallClientState, props: CallingBaseSelectorProps): SDKCallStatus => getCall(state, props)?.state ?? 'None';
export const getDeviceManager = (state: CallClientState): DeviceManagerState => state.deviceManager;
export const getIsScreenShareOn = (state: CallClientState, props: CallingBaseSelectorProps): boolean => getCall(state, props)?.isScreenSharingOn ?? false;
export const getIsPreviewCameraOn = (state: CallClientState, props: CallingBaseSelectorProps): boolean => isPreviewOn(state.deviceManager);
export const getDisplayName = (state: CallClientState, props: CallingBaseSelectorProps): string | undefined => state.callAgent?.displayName;
export const getIdentifier = (state: CallClientState, props: CallingBaseSelectorProps): string => toFlatCommunicationIdentifier(state.userId);

const isPreviewOn = (deviceManager: DeviceManagerState): boolean => {
  // TODO: we should take in a LocalVideoStream that developer wants to use as their 'Preview' view. We should also
  // handle cases where 'Preview' view is in progress and not necessary completed.
  return deviceManager.unparentedViews.length > 0 && deviceManager.unparentedViews[0].view !== undefined;
};
