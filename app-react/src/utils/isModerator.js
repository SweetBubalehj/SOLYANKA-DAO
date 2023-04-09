import { useContractRead, useAccount } from "wagmi";
import factoryABI from "../abi/factoryABI";

const useGetIsModerator = () => {
  const { address } = useAccount();

  const { data: identifyInfo } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "getIdentityInfo",
    args: [address],
  });

  if (identifyInfo && identifyInfo[4] > 0) {
    return true;
  } else return false;
};

export default useGetIsModerator;
