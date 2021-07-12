// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useEffect, useState } from 'react';
import { Spinner } from '@fluentui/react';
import { CallAgent, GroupCallLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { createStatefulCallClient, StatefulCallClient } from '@azure/communication-react';
import { CommunicationUserIdentifier, CommunicationUserKind, getIdentifierKind } from '@azure/communication-common';
import { refreshTokenAsync } from '../utils/refreshToken';
import { useSwitchableFluentTheme } from '../theming/SwitchableFluentThemeProvider';
import { createAzureCommunicationUserCredential } from '../../utils';
import { CallComposite } from '../../composites/CallComposite';

export interface CallScreenProps {
  token: string;
  userId: CommunicationUserIdentifier;
  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;
  displayName: string;
  onCallEnded: () => void;
  onCallError: (e: Error) => void;
}

export const CallScreen = (props: CallScreenProps): JSX.Element => {
  const { token, userId, callLocator, displayName } = props;
  const [callClient, setCallClient] = useState<StatefulCallClient>();
  const [callAgent, setCallAgent] = useState<CallAgent>();
  const { currentTheme } = useSwitchableFluentTheme();

  useEffect(() => {
    (async () => {
      if (!callClient && !callAgent) {
        const callClient = createStatefulCallClient({ userId: getIdentifierKind(userId) as CommunicationUserKind });
        setCallClient(callClient);
        const callAgent = await callClient.createCallAgent(createAzureCommunicationUserCredential(token, refreshTokenAsync(userId.communicationUserId)), { displayName });
        setCallAgent(callAgent);
      }
    })();
  }, [callAgent, callClient, displayName, token, userId]);

  useEffect(() => {
    return () => {
      callAgent?.dispose();
    };
  }, [callAgent])

  if (!callClient || !callAgent) {
    return <Spinner label={'Creating adapter'} ariaLive="assertive" labelPosition="top" />;
  }

  return <CallComposite callLocator={callLocator} callClient={callClient} callAgent={callAgent} fluentTheme={currentTheme.theme} callInvitationURL={window.location.href} />;
};
