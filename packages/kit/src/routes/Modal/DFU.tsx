import React from 'react';

import { useIsVerticalLayout } from '@onekeyhq/components';
import DFU from '@onekeyhq/kit/src/views/DFU/DFU';

import createStackNavigator from './createStackNavigator';

export enum DFUModalRoutes {
  DFU = 'DFU',
}

export type DFUModalRoutesParams = {
  [DFUModalRoutes.DFU]: undefined;
};

const DappConnectionModalNavigator =
  createStackNavigator<DFUModalRoutesParams>();

const modalRoutes = [
  {
    name: DFUModalRoutes.DFU,
    component: DFU,
  },
];

const DappConnectionStack = () => {
  const isVerticalLayout = useIsVerticalLayout();
  return (
    <DappConnectionModalNavigator.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: !!isVerticalLayout,
      }}
    >
      {modalRoutes.map((route) => (
        <DappConnectionModalNavigator.Screen
          key={route.name}
          name={route.name}
          component={route.component}
        />
      ))}
    </DappConnectionModalNavigator.Navigator>
  );
};

export default DappConnectionStack;
