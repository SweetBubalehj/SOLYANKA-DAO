import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useGetIsKYC = () => {
  const { address } = useAccount();

  const { data: KYCStatus } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "getIsKYC",
    args: [address],
  });

  return KYCStatus;
};

export default useGetIsKYC;
