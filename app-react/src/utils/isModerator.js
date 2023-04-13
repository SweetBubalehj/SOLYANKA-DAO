import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useGetIsModerator = () => {
  const { address } = useAccount();

  const { data: identifyInfo } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "getIdentityInfo",
    args: [address],
  });

  if (identifyInfo && identifyInfo[4] > 0) {
    return true;
  } else return false;
};

export default useGetIsModerator;
