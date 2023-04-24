import { useState, useEffect } from "react";
import {
  Button,
  InputNumber,
  Modal,
  Alert,
  Space,
  Spin,
  Col,
  Row,
  Typography,
  notification,
} from "antd";
import {
  useContractWrite,
  usePrepareContractWrite,
  useContractRead,
  useAccount,
  useBlockNumber,
} from "wagmi";
import {
  Address as stakingAddress,
  ABI as stakingABI,
} from "../contracts/stakingContract";
import {
  Address as tokenAddress,
  ABI as tokenABI,
} from "../contracts/tokenContract"; //<- ипользуй этот аби
import useCheckKYC from "../utils/isKYC";
import { ethers } from "ethers";
import useCheckIdentity from "../utils/isIdentified";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

const StakingCards = () => {
  const [isModalStakingOpen, setIsModalStakingOpen] = useState(false);
  const [isModalRewardOpen, setisModalRewardOpen] = useState(false);
  const [isModalBalanceOpen, setIsModalBalanceOpen] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [balance, setBalance] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(1);
  const isUserKYC = useCheckKYC();
  const { address: userAddress } = useAccount();

  const isVerified = useCheckIdentity();

  const provider = window.ethereum
    ? new ethers.providers.Web3Provider(window.ethereum)
    : new ethers.providers.JsonRpcProvider(
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      );

  const getBlockTimestamp = async () => {
    const block = await provider.getBlock();
    setCurrentTimestamp(block.timestamp);
  };

  const transactionIsSuccess = () => {
    notification.success({
      message: "Transaction successful",
      placement: "bottomRight",
    });
  };

  const transactionIsLoading = () => {
    notification.warning({
      message: "Check your wallet",
      placement: "bottomRight",
    });
  };

  const { data: _balance } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: [userAddress],
  });

  const { data: allowanceInfo } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "allowance",
    args: [userAddress, stakingAddress],
  });

  const { data: addressStaked } = useContractRead({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "addressStaked",
    args: [userAddress],
  });

  const { data: stakeInfo } = useContractRead({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "stakeInfos",
    args: [userAddress],
  });

  function myBalance() {
    let balance = 0;
    balance = _balance;
    if (typeof balance !== "undefined") {
      balance = fromWei(balance);
    }
    console.log(balance);
    return balance;
  }

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "approve",
    args: stakeAmount ? [stakingAddress, toWei(stakeAmount)] : [],
  });
  const {
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    write: approve,
  } = useContractWrite(approveConfig);

  function approveTokenIn() {
    try {
      approve?.();
    } catch (e) {
      console.log(e.message);
    }
  }
  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return "~1m";
    }

    const weeks = Math.floor(seconds / 604800);
    seconds %= 604800;
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const formattedDuration = [
      weeks > 0 && `${weeks}w`,
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
    ]
      .filter(Boolean)
      .join(" ");

    return formattedDuration;
  };

  function TimeRemaining() {
    return (
      <Alert
        message={`End time remaining: ${formatDuration(
          stakeInfo?.endTS - currentTimestamp
        )}.`}
        showIcon
        icon={<ClockCircleOutlined />}
      />
    );
  }

  const { config: stakeConfig } = usePrepareContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "stakeToken",
    args: stakeAmount ? [toWei(stakeAmount)] : [],
  });
  const {
    isLoading: stakeLoading,
    isSuccess: stakeSuccess,
    write: stakeToken,
  } = useContractWrite(stakeConfig);

  const { rewardConfig } = usePrepareContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "claimReward",
  });
  const {
    isLoading: rewardLoading,
    isSuccess: rewardSuccess,
    write: claimReward,
  } = useContractWrite(rewardConfig);

  function handleStakeAmountChange(newStakeAmount) {
    setStakeAmount(newStakeAmount);
  }

  console.log(currentTimestamp);

  useEffect(() => {
    function updateBalance() {
      const newBalance = myBalance();
      setBalance(newBalance);
    }
    updateBalance();
  });

  useEffect(() => {
    if (approveLoading) {
      transactionIsLoading();
    }
  }, [approveLoading]);

  useEffect(() => {
    if (approveSuccess) {
      transactionIsSuccess();
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (stakeLoading) {
      transactionIsLoading();
    }
  }, [stakeLoading]);

  useEffect(() => {
    if (stakeSuccess) {
      transactionIsSuccess();
    }
  }, [stakeSuccess]);

  useEffect(() => {
    getBlockTimestamp();
  }, []);

  useEffect(() => {
    if (rewardLoading) {
      transactionIsLoading();
    }
  }, [rewardLoading]);

  useEffect(() => {
    if (rewardSuccess) {
      transactionIsSuccess();
    }
  }, [rewardSuccess]);

  const showModalStaking = () => {
    if (isUserKYC) {
      setIsModalStakingOpen(true);
    }
  };

  const handleReward = () => {
    try {
      claimReward?.();
      console.log("some");
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleStake = () => {
    stakeToken?.();
  };

  const handleApprove = () => {
    approve?.();
  };

  const showModalReward = () => {
    if (isUserKYC) {
      setisModalRewardOpen(true);
    }
  };

  const showModalBalance = () => {
    if (isUserKYC) {
      setIsModalBalanceOpen(true);
    }
  };

  const handleOkStaking = () => {
    setIsModalStakingOpen(false);
  };

  const handleOkBalance = () => {
    setIsModalBalanceOpen(false);
  };

  const handleCancel = () => {
    setIsModalStakingOpen(false);
    setisModalRewardOpen(false);
    setIsModalBalanceOpen(false);
  };

  if (isVerified === undefined) {
    return (
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: "50px" }}
      >
        <Spin tip="Awaiting Wallet" size="large">
          <div />
        </Spin>
      </Space>
    );
  }

  if (!isVerified) {
    return (
      <Alert
        style={{ width: "100%", marginBottom: "50px" }}
        message="You are not registered"
        description="Please identify yourself to use application."
        type="warning"
        showIcon
      />
    );
  }

  if (!isUserKYC && isVerified) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <Alert
            message="Warning"
            description="You haven't completed KYC. Staking is available only for members of KYC."
            type="warning"
            showIcon
          />
        </div>
        <Row gutter={[16, 16]} justify="center" disabled>
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={8}
            xl={8}
            className="check"
            onClick={showModalStaking}
          >
            <svg
              style={{
                backgroundColor: "lightblue",
                borderRadius: "50px",
                padding: "10%",
                height: "100%",
                width: "50%",
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
            </svg>
            <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
              Staking
            </h2>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={8}
            xl={8}
            className="check"
            onClick={showModalReward}
          >
            <svg
              style={{
                backgroundColor: "lightgreen",
                borderRadius: "50px",
                padding: "10%",
                height: "100%",
                width: "50%",
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
            </svg>
            <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
              Get Reward
            </h2>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={12}
            lg={8}
            xl={8}
            className="check"
            onClick={showModalBalance}
          >
            <svg
              style={{
                backgroundColor: "pink",
                borderRadius: "50px",
                padding: "10%",
                height: "100%",
                width: "50%",
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H256c-16.5 0-32.5 2.1-47.8 6c-.1-2-.2-4-.2-6c0-53 43-96 96-96s96 43 96 96zm-16 32c3.5 0 7 .1 10.4 .3c4.2 .3 8.4 .7 12.6 1.3C424.6 109.1 450.8 96 480 96h11.5c10.4 0 18 9.8 15.5 19.9l-13.8 55.2c15.8 14.8 28.7 32.8 37.5 52.9H544c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H512c-9.1 12.1-19.9 22.9-32 32v64c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H256v32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V416c-34.9-26.2-58.7-66.3-63.2-112H68c-37.6 0-68-30.4-68-68s30.4-68 68-68h4c13.3 0 24 10.7 24 24s-10.7 24-24 24H68c-11 0-20 9-20 20s9 20 20 20H99.2c12.1-59.8 57.7-107.5 116.3-122.8c12.9-3.4 26.5-5.2 40.5-5.2H384zm64 136a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
            </svg>
            <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
              My balance
            </h2>
          </Col>
        </Row>
      </div>
    );
  }

  if (isUserKYC && isVerified) {
    return (
      <Row gutter={[16, 16]} justify="center">
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={8}
          xl={8}
          className="check"
          onClick={showModalStaking}
        >
          <svg
            style={{
              backgroundColor: "lightblue",
              borderRadius: "50px",
              padding: "10%",
              height: "100%",
              width: "50%",
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
          </svg>
          <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
            Staking
          </h2>
        </Col>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={8}
          xl={8}
          className="check"
          onClick={showModalReward}
        >
          <svg
            style={{
              backgroundColor: "lightgreen",
              borderRadius: "50px",
              padding: "10%",
              height: "100%",
              width: "50%",
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
          </svg>
          <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
            Get Reward
          </h2>
        </Col>
        <Col
          xs={24}
          sm={12}
          md={12}
          lg={8}
          xl={8}
          className="check"
          onClick={showModalBalance}
        >
          <svg
            style={{
              backgroundColor: "pink",
              borderRadius: "50px",
              padding: "10%",
              height: "100%",
              width: "50%",
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H256c-16.5 0-32.5 2.1-47.8 6c-.1-2-.2-4-.2-6c0-53 43-96 96-96s96 43 96 96zm-16 32c3.5 0 7 .1 10.4 .3c4.2 .3 8.4 .7 12.6 1.3C424.6 109.1 450.8 96 480 96h11.5c10.4 0 18 9.8 15.5 19.9l-13.8 55.2c15.8 14.8 28.7 32.8 37.5 52.9H544c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H512c-9.1 12.1-19.9 22.9-32 32v64c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H256v32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V416c-34.9-26.2-58.7-66.3-63.2-112H68c-37.6 0-68-30.4-68-68s30.4-68 68-68h4c13.3 0 24 10.7 24 24s-10.7 24-24 24H68c-11 0-20 9-20 20s9 20 20 20H99.2c12.1-59.8 57.7-107.5 116.3-122.8c12.9-3.4 26.5-5.2 40.5-5.2H384zm64 136a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
          </svg>
          <h2 style={{ fontFamily: "'Delicious Handrawn', cursive;" }}>
            My balance
          </h2>
        </Col>
        <Modal
          footer={[
            <Button key="Cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button type="primary" key="Approve" onClick={handleApprove}>
              Approve
            </Button>,
            <Button
              type="primary"
              key="Stake"
              disabled={
                stakeAmount &&
                allowanceInfo &&
                stakeAmount > fromWei(allowanceInfo)
              }
              onClick={handleStake}
            >
              Stake
            </Button>,
          ]}
          title="Staking"
          open={isModalStakingOpen}
          onOk={handleOkStaking}
          onCancel={handleCancel}
        >
          <Text>Staking tokens amount: </Text>
          <InputNumber
            style={{ marginLeft: "10px" }}
            value={stakeAmount}
            min={1}
            max={10000}
            onChange={handleStakeAmountChange}
          />
          {stakeAmount &&
            allowanceInfo &&
            stakeAmount > fromWei(allowanceInfo) && (
              <Col xs={24} style={{ marginTop: "16px" }}>
                <Alert
                  message="Please approve tokens"
                  description="Staking amount is greater than your allowance."
                  type="error"
                  showIcon
                />
              </Col>
            )}
        </Modal>
        .
        <Modal
          title="Reward"
          open={isModalRewardOpen}
          footer={[
            <Button key="Cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              disabled={
                addressStaked == undefined ||
                addressStaked == false ||
                stakeInfo?.endTS > currentTimestamp
              }
              type="primary"
              key="GetReward"
              onClick={handleReward}
            >
              Get Reward
            </Button>,
          ]}
          onCancel={handleCancel}
        >
          {addressStaked == undefined || addressStaked == false ? (
            <Alert
              message="Not participated"
              description={"You are not participating in staking."}
              type="warning"
              showIcon
            />
          ) : (
            stakeInfo?.endTS > currentTimestamp && (
              <>
                <TimeRemaining />
                <br></br>
                <Alert
                  message="Not yet time"
                  description={"Staking time is not up."}
                  type="warning"
                  showIcon
                />
              </>
            )
          )}
          {addressStaked != undefined && addressStaked == true && (
            <h3>
              Staked abount: {parseFloat(fromWei(stakeInfo?.amount)).toFixed(2)}{" "}
              SLK
            </h3>
          )}
        </Modal>
        <Modal
          title="Balance"
          open={isModalBalanceOpen}
          onOk={handleOkBalance}
          onCancel={handleCancel}
          footer={[
            <Button type="primary" key="Cancel" onClick={handleCancel}>
              Ok
            </Button>,
          ]}
        >
          {balance !== undefined ? (
            <h1>Tokens: {parseFloat(balance).toFixed(2)} SLK</h1>
          ) : (
            <h3>Loading...</h3>
          )}
        </Modal>
      </Row>
    );
  }
};

export default StakingCards;
