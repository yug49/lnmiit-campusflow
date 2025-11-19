import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { mainnet, sepolia } from "viem/chains";

/**
 * PrivyProviderWrapper - Wraps the application with Privy authentication
 *
 * This component configures Privy for:
 * - Google OAuth authentication (primary login method)
 * - Embedded Ethereum wallets (for future blockchain integration)
 * - Custom appearance matching the app theme
 */
const PrivyProviderWrapper = ({ children }) => {
    const appId = process.env.REACT_APP_PRIVY_APP_ID;
    const clientId = process.env.REACT_APP_PRIVY_CLIENT_ID;

    if (!appId) {
        console.error(
            "REACT_APP_PRIVY_APP_ID is not set in environment variables"
        );
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Configuration Error</h2>
                <p>
                    REACT_APP_PRIVY_APP_ID is not set. Please check your .env
                    file.
                </p>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
            clientId={clientId}
            config={{
                // Appearance configuration
                appearance: {
                    theme: "light",
                    accentColor: "#0078D4",
                    logo: "/images/lnmiit-logo.png",
                    showWalletLoginFirst: false,
                },

                // Login methods - Only Google OAuth enabled
                loginMethods: ["google"],

                // Embedded wallet configuration - Required for MoU signing
                embeddedWallets: {
                    createOnLogin: "all-users", // Create embedded wallet for all users
                    noPromptOnSignature: false, // Show signature prompt for security
                },

                // Supported chains - Required by Privy
                supportedChains: [mainnet, sepolia],

                // Default chain
                defaultChain: mainnet,

                // Legal and support links
                legal: {
                    termsAndConditionsUrl: "/terms",
                    privacyPolicyUrl: "/privacy",
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
};

export default PrivyProviderWrapper;
