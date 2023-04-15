import React, { useEffect, useState, useMemo } from "react";
import {
  useContractWrite,
  useContractRead,
  usePrepareContractWrite,
  useAccount,
} from "wagmi";
import {
  Modal,
  Select,
  Button,
  Alert,
  Input,
  Switch,
  Typography,
  Row,
  Col,
  Card,
  Progress,
  notification,
  Divider,
  Spin,
  InputNumber,
} from "antd";
import {
  Address as factoryAddress,
  ABI as factoryABI,
} from "../contracts/factoryContract";
import {
  Address as tokenAddress,
  ABI as tokenABI,
} from "../contracts/tokenContract";
import { ABI as TWvotingABI } from "../contracts/tokenWeightedContract";
import { ethers } from "ethers";
import useCheckIdentity from "../utils/isIdentified";
import { ClockCircleOutlined } from "@ant-design/icons";
import useCheckKYC from "../utils/isKYC";
import useGetIsModerator from "../utils/isModerator";
import VotingModeration from "./VotingModeration";
import getRandomGradient from "../utils/getRandomGradient";

const { Text, Title } = Typography;

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

const TWVotingCards = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [gradients, setGradients] = useState([]);
  const [voteWeight, setVoteWeight] = useState(1);
  const [titles, setTitles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const isUserVerified = useCheckIdentity();
  const isUserKYC = useCheckKYC();
  const isUserModerator = useGetIsModerator();
  const { address: userAddress } = useAccount();

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

  const getTimestamp = async () => {
    const block = await provider.getBlock();
    setCurrentTimestamp(block.timestamp);
  };

  const { data: TWdata } = useContractRead({
    address: factoryAddress,
    abi: factoryABI,
    functionName: "getDeployedTokenWeightedVotings",
  });

  const { data: voters } = useContractRead({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "addressToVoter",
    args: [userAddress],
  });

  const { data: winnerName } = useContractRead({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "getWinnerName",
  });

  const { data: endTime } = useContractRead({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "endTime",
  });

  const { data: proposalNames } = useContractRead({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "getProposalsNames",
  });

  const { data: proposalVotes } = useContractRead({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "getProposalsVotes",
  });

  const { data: allowanceInfo } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "allowance",
    args: [userAddress, TWdata?.[selectedVoting]],
  });

  const { config: voteConfig } = usePrepareContractWrite({
    address: TWdata?.[selectedVoting],
    abi: TWvotingABI,
    functionName: "vote",
    args: [toWei(voteWeight), selectedProposal],
  });
  const { isLoading, isSuccess, write: vote } = useContractWrite(voteConfig);

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "approve",
    args: [TWdata?.[selectedVoting], toWei(voteWeight)],
  });
  const {
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    write: approve,
  } = useContractWrite(approveConfig);

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

  const filteredList = useMemo(() => {
    if (!searchQuery) return titles.map((title, index) => ({ index, title }));

    return titles
      .map((title, index) => ({ index, title }))
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          TWdata[item.index].toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, titles, TWdata]);

  const showModal = (index) => {
    if (index != undefined) {
      setSelectedProposal(null);
      setSelectedVoting(index);
      setIsModalVisible(true);
      getTimestamp();
    }
  };

  const handleCancel = () => {
    setSelectedProposal(null);
    setIsModalVisible(false);
  };

  useEffect(() => {
    const newGradients = filteredList.map(() => getRandomGradient());
    setGradients(newGradients);
  }, [filteredList]);

  useEffect(() => {
    if (isLoading) {
      transactionIsLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      transactionIsSuccess();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (TWdata) {
      const fetchTitles = async () => {
        const newTitles = [];
        for (const address of TWdata) {
          const contract = new ethers.Contract(address, TWvotingABI, provider);
          const title = await contract.title();
          newTitles.push(title);
        }
        setTitles(newTitles);
      };
      fetchTitles();
    }
  }, [TWdata]);

  function TimeRemaining() {
    return (
      <Alert
        message={`End time remaining: ${formatDuration(
          endTime - currentTimestamp
        )}.`}
        showIcon
        icon={<ClockCircleOutlined />}
      />
    );
  }

  const calculatePercentage = (votes, totalVotes) => {
    return (votes / totalVotes) * 100;
  };

  const totalVotes = proposalVotes?.reduce(
    (acc, votes) => acc + Number(votes),
    0
  );

  if (isUserVerified === undefined) {
    return;
  }

  if (!isUserVerified) {
    return;
  }

  const renderModalContent = () => {
    if (currentTimestamp >= endTime) {
      if (winnerName === undefined) {
        return (
          <Alert
            message="Error"
            description="Voting results ended with a tie."
            type="error"
            showIcon
          />
        );
      }
      return (
        <Alert
          message="Ended"
          description={`Winner name: "${winnerName}".`}
          type="success"
          showIcon
        />
      );
    }

    if (TWdata?.[selectedVoting] && voters?.voted) {
      return (
        <>
          <TimeRemaining />
          <br />
          <Alert
            message={`You have already voted. Your choice is: ${
              proposalNames[voters?.choice]
            }`}
            type="warning"
            showIcon
          />
        </>
      );
    }

    if (!isUserKYC) {
      return (
        <>
          <TimeRemaining />
          <br />
          <Alert
            message="You are not identified"
            description="Verify your identity via KYC to get more features."
            type="warning"
            showIcon
          />
        </>
      );
    }

    return (
      <>
        <TimeRemaining />
        <br />

        <Select
          value={selectedProposal}
          placeholder="Select a proposal"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedProposal(value)}
        >
          {proposalNames &&
            proposalNames.map((proposalName, index) => (
              <Select.Option key={index} value={index}>
                {proposalName}
              </Select.Option>
            ))}
        </Select>
        <br />
        <br />
        <Row justify="center" align="middle" gutter={[16, 16]}>
          <Col xs={13} sm={8}>
            <Text>Token weight amount:</Text>
          </Col>
          <Col xs={11} sm={5}>
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={10000}
              value={voteWeight}
              onChange={setVoteWeight}
            />
          </Col>
          <Col xs={24} sm={5}>
            <Button
              key="submit"
              type="primary"
              onClick={() => approve?.()}
              style={{ width: "100%" }}
            >
              Approve
            </Button>
          </Col>
          <Col xs={24} sm={5}>
            <Button
              key="submit"
              type="primary"
              disabled={
                voteWeight &&
                allowanceInfo &&
                voteWeight > fromWei(allowanceInfo)
              }
              onClick={() => vote?.()}
              style={{ width: "100%" }}
            >
              Vote
            </Button>
          </Col>
          {voteWeight &&
            allowanceInfo &&
            voteWeight > fromWei(allowanceInfo) && (
              <Col xs={24} style={{ marginTop: "16px" }}>
                <Alert
                  message="Please approve tokens"
                  description="Token weight amount is greater than your allowance."
                  type="error"
                  showIcon
                />
              </Col>
            )}
        </Row>
      </>
    );
  };

  return (
    <>
      <Title level={3} style={{ margin: "10px auto", textAlign: "center" }}>
        Token Weighted Votings
      </Title>
      <Input
        placeholder="Search by title or address"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        allowClear
      />
      <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
        {filteredList.map((item, index) => (
          <Col xs={24} sm={24} md={12} lg={12} xl={8} key={item.index}>
            <Card hoverable>
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "10px",
                  background: gradients[index],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
                onClick={() => showModal(item.index)}
              >
                <Typography.Title level={4} style={{ color: "white" }}>
                  {item.title}
                </Typography.Title>
              </div>
              <Card.Meta
                style={{ textAlign: "center", padding: "10px" }}
                description={`Voting contract at address: ${
                  TWdata[item.index]
                }`}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  marginTop: "10px",
                }}
              >
                <Switch
                  size="small"
                  checkedChildren="KYC"
                  disabled
                  defaultChecked
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`Voting: ${titles[selectedVoting]}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {isUserModerator && (
          <VotingModeration votingAddress={TWdata?.[selectedVoting]} />
        )}
        {renderModalContent()}
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {proposalVotes?.map((votes, index) => (
            <div key={index} style={{ width: "85%" }}>
              <Text>Proposal {proposalNames?.[index]}:</Text>
              <Progress
                percent={calculatePercentage(votes, totalVotes)}
                format={(percent) => `${percent.toFixed(2)}%`}
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default TWVotingCards;
