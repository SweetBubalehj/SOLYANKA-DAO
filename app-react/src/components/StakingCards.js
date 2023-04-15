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
  const [balance, setBalance] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(1);
  const [isApproved, setIsApproved] = useState(false);
  const isUserKYC = useCheckKYC();
  const { address: userAddress } = useAccount();

  const isVerified = useCheckIdentity();

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
    args: [stakingAddress, toWei(stakeAmount)],
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

  const { config: stakeConfig } = usePrepareContractWrite({
    address: stakingAddress,
    abi: stakingABI,
    functionName: "stakeToken",
    args: [toWei(stakeAmount)],
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

  const handleApprove = () => {
    approveTokenIn(stakeAmount);
    setIsApproved(true);
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
    if (isApproved) {
      stakeToken?.();
    } else {
      console.log("you should approve it first");
    }
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
            <Button type="primary" key="Stake" onClick={handleStake}>
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
        </Modal>
        .
        <Modal
          title="Reward"
          open={isModalRewardOpen}
          footer={[
            <Button key="Cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button type="primary" key="GetReward" onClick={handleReward}>
              Get Reward
            </Button>,
          ]}
          onCancel={handleCancel}
        ></Modal>
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
