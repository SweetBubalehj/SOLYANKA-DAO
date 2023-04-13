import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useGetIsModerator = () => {
  const { address } = useAccount();

  const { data: roleInfo } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "getRole",
    args: [address],
  });

  if (roleInfo && roleInfo > 0) {
    return true;
  } else return false;
};

export default useGetIsModerator;
