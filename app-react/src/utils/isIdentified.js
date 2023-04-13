import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useCheckIdentity = () => {
  const { address } = useAccount();

  const { data: isVerified } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "checkIdentity",
    args: [address],
  });

  return isVerified;
};

export default useCheckIdentity;
