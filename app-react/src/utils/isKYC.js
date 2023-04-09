import { useContractRead, useAccount } from "wagmi";
import factoryABI from "../abi/factoryABI";

const useGetIsKYC = () => {
  const { address } = useAccount();

  const { data: KYCStatus } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "getIsKYC",
    args: [address],
  });

  return KYCStatus;
};

export default useGetIsKYC;
