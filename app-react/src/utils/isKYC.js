import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useCheckKYC = () => {
  const { address } = useAccount();

  const { data: KYCStatus } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "checkKYC",
    args: [address],
  });

  return KYCStatus;
};

export default useCheckKYC;
