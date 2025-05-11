"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/utils/wagmi";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import Button from "@/components/common/Button";

export function ConnectAndSIWE() {
  const dispatch = useDispatch();
  const { connect } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const address = data.accounts[0];
        const chainId = data.chainId;
        const m = new SiweMessage({
          domain: document.location.host,
          address,
          chainId,
          uri: document.location.origin,
          version: "1",
          statement: "Sign in to Base Savings App",
          nonce: generateNonce(), // In production, get this from your backend
        });
        setMessage(m);
        signMessage({ message: m.prepareMessage() });
      },
    },
  });

  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState(undefined);
  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: (sig) => setSignature(sig),
    },
  });

  const [message, setMessage] = useState(undefined);
  const [valid, setValid] = useState(undefined);

  // Generate a simple nonce (in production, fetch from server)
  const generateNonce = () => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client || !message) return;

    const isValid = await client.verifyMessage({
      address: account.address,
      message: message.prepareMessage(),
      signature,
    });

    setValid(isValid);

    // If valid, authenticate in your application
    if (isValid) {
      dispatch(
        login({
          userId: account.address,
          wallet: account.address,
          ethSignature: signature,
        })
      );
    }
  }, [signature, account, client, message, dispatch]);

  useEffect(() => {
    checkValid();
  }, [signature, account, checkValid]);

  return (
    <div className="flex flex-col gap-4">
      {!account.address && (
        <Button
          variant="primary"
          onClick={() => connect({ connector: cbWalletConnector })}
          className="w-full"
        >
          Connect Smart Wallet
        </Button>
      )}

      {account.address && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-600 mb-2">Connected Account</div>
          <div className="font-medium text-gray-900">{account.address}</div>
          {valid !== undefined && (
            <div
              className={`mt-2 text-sm ${
                valid ? "text-green-600" : "text-red-600"
              }`}
            >
              Authentication: {valid ? "Success" : "Failed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
