import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useGetIsVerified = () => {
  const { address } = useAccount();

  const { data: isVerified } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "getIsIdentified",
    args: [address],
  });

  return isVerified;
};

export default useGetIsVerified;