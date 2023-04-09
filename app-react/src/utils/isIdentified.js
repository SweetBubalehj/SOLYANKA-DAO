import { useContractRead, useAccount } from "wagmi";
import factoryABI from "../abi/factoryABI";

const useGetIsVerified = () => {
  const { address } = useAccount();

  const { data: isVerified } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "getIsIdentified",
    args: [address],
  });

  return isVerified;
};

export default useGetIsVerified;