import detectEthereumProvider from '@metamask/detect-provider';

/**
 * Detects and returns the best available Ethereum provider.
 * Prioritizes MetaMask if multiple providers are available.
 * 
 * @returns A promise that resolves with the detected provider, or null if no provider is found.
 */
export async function getEthereumProvider(): Promise<any> {
    const provider = await detectEthereumProvider();

    if (provider) {
        // If multiple providers are detected, prioritize MetaMask
        if ((provider as any).providers) {
            const metaMaskProvider = (provider as any).providers.find((p: any) => p.isMetaMask);
            if (metaMaskProvider) {
                return metaMaskProvider;
            }
        }
        return provider;
    }

    return null;
}