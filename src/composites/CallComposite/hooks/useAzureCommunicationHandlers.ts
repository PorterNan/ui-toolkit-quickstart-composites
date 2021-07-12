import {
  createDefaultCallingHandlers,
  useCall,
  useCallAgent,
  useCallClient,
  useDeviceManager,
  Common,
  DefaultCallingHandlers
} from '@azure/communication-react';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const useAzureCommunicationHandlers = <Props>(component: (props: Props) => JSX.Element): Common<Props, DefaultCallingHandlers> => {
  return createDefaultCallingHandlers(useCallClient(), useCallAgent(), useDeviceManager(), useCall()) as any;
};