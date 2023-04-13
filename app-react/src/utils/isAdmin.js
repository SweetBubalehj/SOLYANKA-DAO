import { useContractRead, useAccount } from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";

const useGetIsAdmin = () => {
  const { address } = useAccount();

  const { data: isAdmin } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "identities",
    args: [address],
  });

  //добавил isAdmin(!)
  if (isAdmin && isAdmin.roleWeight > 1) {
    return true;
  } else {
    return false;
  }
};

export default useGetIsAdmin;
