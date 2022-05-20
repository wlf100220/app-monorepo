import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/core';

import {
  ModalScreenProps,
  RootRoutes,
  RootRoutesParams,
} from '../routes/types';

import { useAppSelector } from './redux';

type NavigationProps = ModalScreenProps<RootRoutesParams>;

export const useOnboarding = () => {
  const boardingCompleted = useAppSelector((s) => s.status.boardingCompleted);
  const navigation = useNavigation<NavigationProps['navigation']>();
  useEffect(() => {
    if (!boardingCompleted) {
      navigation.replace(RootRoutes.Welcome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
