import React, { FC, memo, useCallback } from 'react';

import { DrawerActions } from '@react-navigation/native';

import {
  Account,
  Box,
  DialogManager,
  HStack,
  Pressable,
} from '@onekeyhq/components';
import type { Account as AccountEngineType } from '@onekeyhq/engine/src/types/account';
import type { Network } from '@onekeyhq/engine/src/types/network';
import type { Wallet } from '@onekeyhq/engine/src/types/wallet';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { ValidationFields } from '@onekeyhq/kit/src/components/Protected';
import { useNavigation } from '@onekeyhq/kit/src/hooks';
import { setHaptics } from '@onekeyhq/kit/src/hooks/setHaptics';
import useLocalAuthenticationModal from '@onekeyhq/kit/src/hooks/useLocalAuthenticationModal';
import { ManagerAccountModalRoutes } from '@onekeyhq/kit/src/routes/Modal/ManagerAccount';
import { ModalRoutes, RootRoutes } from '@onekeyhq/kit/src/routes/types';
import AccountModifyNameDialog from '@onekeyhq/kit/src/views/ManagerAccount/ModifyAccount';
import useRemoveAccountDialog from '@onekeyhq/kit/src/views/ManagerAccount/RemoveAccount';

import ItemActionButton from './ItemActionButton';

import type { SectionListData } from 'react-native';

export type AccountGroup = { title: Network; data: AccountEngineType[] };

type Props = {
  section: SectionListData<AccountEngineType, AccountGroup>;
  item: AccountEngineType;
  activeWallet: Wallet | null;
  activeNetwork: Network | null;
  activeAccount: AccountEngineType | null;
  refreshAccounts: (walletId?: string) => void;
};

const AccountSectionItem: FC<Props> = ({
  section,
  item,
  activeWallet,
  activeNetwork,
  activeAccount,
  refreshAccounts,
}) => {
  const { serviceAccount, serviceNetwork } = backgroundApiProxy;
  const navigation = useNavigation();

  const { showVerify } = useLocalAuthenticationModal();
  const { show: showRemoveAccountDialog, RemoveAccountDialog } =
    useRemoveAccountDialog();

  const handleChange = useCallback(
    (value) => {
      switch (value) {
        case 'rename':
          DialogManager.show({
            render: (
              <AccountModifyNameDialog
                visible
                account={item}
                onDone={() => refreshAccounts(activeWallet?.id)}
              />
            ),
          });

          break;
        case 'detail':
          navigation.navigate(RootRoutes.Modal, {
            screen: ModalRoutes.ManagerAccount,
            params: {
              screen: ManagerAccountModalRoutes.ManagerAccountModal,
              params: {
                walletId: activeWallet?.id ?? '',
                accountId: item.id,
                networkId: activeNetwork?.id ?? '',
                refreshAccounts: () => refreshAccounts(activeWallet?.id),
              },
            },
          });
          break;
        case 'remove':
          if (activeWallet?.type === 'watching') {
            showRemoveAccountDialog(
              activeWallet?.id ?? '',
              item.id,
              undefined,
              () => refreshAccounts(activeWallet?.id),
            );
          } else {
            showVerify(
              (pwd) => {
                showRemoveAccountDialog(
                  activeWallet?.id ?? '',
                  item.id,
                  pwd,
                  () => refreshAccounts(activeWallet?.id),
                );
              },
              () => {},
              null,
              ValidationFields.Account,
            );
          }
          break;

        default:
          break;
      }
    },
    [
      item,
      activeNetwork?.id,
      navigation,
      refreshAccounts,
      activeWallet?.id,
      activeWallet?.type,
      showRemoveAccountDialog,
      showVerify,
    ],
  );

  return (
    <>
      <Pressable
        px={2}
        onPress={() => {
          setHaptics();
          serviceNetwork.changeActiveNetwork(section?.title?.id);
          serviceAccount.changeActiveAccount({
            accountId: item.id,
            walletId: activeWallet?.id ?? '',
          });
          setTimeout(() => {
            navigation.dispatch(DrawerActions.closeDrawer());
          });
        }}
      >
        {({ isHovered, isPressed }) => (
          <HStack
            p="7px"
            borderWidth={1}
            borderColor={isHovered ? 'border-hovered' : 'transparent'}
            bgColor={isPressed ? 'surface-pressed' : undefined}
            borderStyle="dashed"
            bg={
              activeAccount?.id === item.id &&
              activeNetwork?.id === section?.title?.id
                ? 'surface-selected'
                : 'transparent'
            }
            space={4}
            borderRadius="xl"
            alignItems="center"
          >
            <Box flex={1}>
              <Account
                hiddenAvatar
                address={item?.address ?? ''}
                name={item.name}
              />
            </Box>
            <ItemActionButton
              type={activeWallet?.type}
              onChange={handleChange}
            />
          </HStack>
        )}
      </Pressable>
      {RemoveAccountDialog}
    </>
  );
};

export default memo(AccountSectionItem);
