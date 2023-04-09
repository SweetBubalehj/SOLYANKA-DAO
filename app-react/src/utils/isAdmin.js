import { useContractRead, useAccount } from "wagmi";
import factoryABI from "../abi/factoryABI";

const useGetIsAdmin = () => {
  const { address } = useAccount();

  const { data: isAdmin } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "identities",
    args: [address],
  });

  if (isAdmin.roleWeight > 1) {
    return true;
  } else return false;
};

export default useGetIsAdmin;
