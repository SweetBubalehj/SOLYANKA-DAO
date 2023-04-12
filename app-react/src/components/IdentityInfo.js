import React, { useEffect, useState } from "react";
import { useContractRead, useAccount, useContractWrite } from "wagmi";
import factoryABI from "../abi/factoryABI";
import { Card, Typography, Modal, Form, Input, Button } from "antd";

const { Title, Text } = Typography;

const IdentityInfo = () => {
  const { address } = useAccount();

  const { data: identifyInfo } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "getIdentityInfo",
    args: [address],
  });

  const { write: writeIdentityInfo } = useContractWrite({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "updateIdentity",
  });

  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userAge, setUserAge] = useState("0");
  const [hasKYC, setHasKYC] = useState(null);
  const [hasRights, setHasRigths] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (identifyInfo && identifyInfo[0] != null) {
      setUserName(identifyInfo[0]);
    } else {
      setUserName("");
    }
    if (identifyInfo && identifyInfo[1] != null) {
      setUserEmail(identifyInfo[1]);
    } else {
      setUserEmail(null);
    }
    if (identifyInfo && identifyInfo[2] != null) {
      setUserAge(identifyInfo[2]);
    } else {
      setUserAge("");
    }
    if (identifyInfo && identifyInfo[3] > 0) {
      setHasKYC(true);
    } else {
      setHasKYC(false);
    }
    if (identifyInfo && identifyInfo[4] > 0) {
      setHasRigths(true);
    } else {
      setHasRigths(false);
    }
  }, [identifyInfo]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Card title="Your profile">
      {address && (
        <>
          <Title level={2}>Welcome, {userName}!</Title>
          <Text>Email: {userEmail}</Text>
          <br />
          <Text>Age: {userAge.toString()}</Text>
          <br />
          {hasKYC ? (
            <Text>You have completed KYC.</Text>
          ) : (
            <Text>You haven't completed KYC.</Text>
          )}
          {hasRights && <Text>You have moderator rights.</Text>}
          <br />
        </>
      )}
      {address && (
        <Button type="primary" onClick={showModal}>
          Edit profile.
        </Button>
      )}
      <Modal
        title="Edit profile"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form>
          <Form.Item label="Username">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Age">
            <Input
              value={userAge}
              onChange={(e) => setUserAge(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IdentityInfo;
