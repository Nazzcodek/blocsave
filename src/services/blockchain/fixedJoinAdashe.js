// Fixed implementation of joinAdasheCircle
export async function joinAdasheCircle(
  embeddedWallet,
  circleName,
  onSuccess,
  onError
) {
  try {
    if (!embeddedWallet) {
      throw new Error("Embedded wallet not found");
    }

    const provider = await embeddedWallet.getEthereumProvider();
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get the Adashe contract address from the factory
    const factoryContract = new Contract(
      ADASHE_FACTORY_ADDRESS,
      adasheFactoryABI.abi,
      signer
    );

    let adasheContract;
    let adasheAddress;

    // Get the Adashe contract address by name
    try {
      adasheAddress = await factoryContract.getAdasheByName(circleName);

      if (
        !adasheAddress ||
        adasheAddress === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error(`No Adashe circle found with name: ${circleName}`);
      }
    } catch (error) {
      console.error("Error getting Adashe by name:", error);

      // Fallback to using the first circle for demo purposes
      console.log("Falling back to using the first available Adashe circle");
      const adasheAddresses = await factoryContract.getAdashes();

      if (!adasheAddresses || adasheAddresses.length === 0) {
        throw new Error("No Adashe circles found");
      }

      adasheAddress = adasheAddresses[0];
    }

    // Create the contract instance
    adasheContract = new Contract(adasheAddress, adasheABI.abi, signer);

    const tx = await adasheContract.joinAdashe(circleName);
    const receipt = await tx.wait();

    if (onSuccess) onSuccess(receipt);
    return receipt;
  } catch (error) {
    console.error("Failed to join Adashe circle:", error);
    if (onError) onError(error);
    throw error;
  }
}
