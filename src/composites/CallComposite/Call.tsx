// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useEffect, useState } from 'react';
import { CallScreen } from './CallScreen';
import { ConfigurationScreen } from './ConfigurationScreen';
import { Error } from './Error';
import { Theme, PartialTheme } from '@fluentui/react';
import { CallAgent, TeamsMeetingLinkLocator, GroupCallLocator, Call, AudioOptions } from '@azure/communication-calling';
import { StatefulCallClient, PlaceholderProps, FluentThemeProvider, CallAgentProvider, CallClientProvider, CallCompositePage, useCallAgent, CallProvider } from '@azure/communication-react';

export type CallCompositeProps = {
  callClient: StatefulCallClient;
  callAgent: CallAgent;
  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;
  /**
   * Fluent theme for the composite.
   *
   * Defaults to a light theme if undefined.
   */
  fluentTheme?: PartialTheme | Theme;
  callInvitationURL?: string;
  onRenderAvatar?: (props: PlaceholderProps, defaultOnRender: (props: PlaceholderProps) => JSX.Element) => JSX.Element;
};

type MainScreenProps = {
  onRenderAvatar?: (props: PlaceholderProps, defaultOnRender: (props: PlaceholderProps) => JSX.Element) => JSX.Element;
  callInvitationURL?: string;
  callLocator: GroupCallLocator | TeamsMeetingLinkLocator;
};

const MainScreen = ({ callInvitationURL, onRenderAvatar, callLocator }: MainScreenProps): JSX.Element => {
  const [page, setPage] = useState<CallCompositePage>('configuration');
  const [isMicInitialOn, setIsMicInitialOn] = useState(false);


  const callAgent = useCallAgent();
  const [joinedCall, setJoinedCall] = useState<boolean>(false);
  const [call, setCall] = useState<Call | undefined>();

  useEffect(() => {
    if (!joinedCall && page === 'call') {
      const audioOptions: AudioOptions = { muted: !isMicInitialOn };
      const isTeamsMeeting = 'groupId' in callLocator;
      if (isTeamsMeeting) {
        setCall(callAgent?.join(callLocator as TeamsMeetingLinkLocator, { audioOptions }));
      } else {
        setCall(callAgent?.join(callLocator as GroupCallLocator, {
          audioOptions
        }));
      }
      setJoinedCall(true);
    }
  }, [callAgent, callLocator, isMicInitialOn, joinedCall, page]);

  switch (page) {
    case 'configuration':
      return <ConfigurationScreen startCallHandler={(isMicOn): void => { setPage('call'); setIsMicInitialOn(isMicOn) }} />;
    case 'error':
      return <Error rejoinHandler={() => setPage('configuration')} />;
    case 'errorJoiningTeamsMeeting':
      return (
        <Error
          rejoinHandler={() => setPage('configuration')}
          title="Error joining Teams Meeting"
          reason="Access to the Teams meeting was denied."
        />
      );
    case 'removed':
      return (
        <Error
          rejoinHandler={() => setPage('configuration')}
          title="Oops! You are no longer a participant of the call."
          reason="Access to the meeting has been stopped"
        />
      );
    default:
      return (
        <CallProvider call={call}>
          <CallScreen
            endCallHandler={async (): Promise<void> => {
              setPage('configuration');
              setJoinedCall(false);
            }}
            callErrorHandler={(customPage?: CallCompositePage) => {
              customPage ? setPage(customPage) : setPage('error');
            }}
            callLocator={callLocator}
            onRenderAvatar={onRenderAvatar}
            showParticipants={true}
            isMicOn={isMicInitialOn}
            callInvitationURL={callInvitationURL}
          />
        </CallProvider>
      );
  }
};

export const CallApp = (props: CallCompositeProps): JSX.Element => {
  const { callInvitationURL, fluentTheme, callClient, callAgent, onRenderAvatar, callLocator } = props;

  useEffect(() => {
    (async () => {
      const devices = await props.callClient.getDeviceManager();
      await devices.askDevicePermission({ video: true, audio: true });
      devices.getCameras();
      devices.getMicrophones();
      devices.getSpeakers();
    })();
  }, [props.callClient]);

  return (
    <FluentThemeProvider fluentTheme={fluentTheme}>
      <CallClientProvider callClient={callClient}>
        <CallAgentProvider callAgent={callAgent}>
          <MainScreen onRenderAvatar={onRenderAvatar} callInvitationURL={callInvitationURL} callLocator={callLocator} />
        </CallAgentProvider>
      </CallClientProvider>
    </FluentThemeProvider>
  );
};
