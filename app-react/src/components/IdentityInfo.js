import React, { useEffect, useState } from "react";
import {
  useContractRead,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import factoryABI from "../abi/factoryABI";
import useGetIsModerator from "../utils/isModerator";
import useGetIsAdmin from "../utils/isAdmin";
import { Card, Typography, Modal, Form, Input, Button } from "antd";

const { Title, Text } = Typography;

const IdentityInfo = () => {
  //Contract part
  const { address } = useAccount();

  const [newUserName, setNewUserName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAge, setNewAge] = useState(13);

  const { config } = usePrepareContractWrite({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "updateIdentity",
    args: [newUserName, newEmail, newAge],
  });

  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  const { data: identifyInfo } = useContractRead({
    address: "0xE7cDD9eDD77fC483F927233459F4f2A04008c616",
    abi: factoryABI,
    functionName: "getIdentityInfo",
    args: [address],
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

  //Modal part
  const showModal = () => {
    setNewUserName(userName);
    setNewEmail(userEmail);
    setNewAge(userAge);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    write?.(userName, userEmail, Number(userAge));
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Fixed typo
  };
  //

  //Admin and Moderator part
  const isAdmin = useGetIsAdmin();
  const isModerator = useGetIsModerator();

  const handleAdminButtonClick = () => {
    if (isAdmin) {
      // Выполните действие, связанное с админской кнопкой
    }
  };

  const handleModeratorButtonClick = () => {
    if (isModerator) {
      // Выполните действие, связанное с модераторской кнопкой
    }
  };
  //
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
      {address && !isLoading && (
        <Button type="primary" onClick={showModal}>
          Edit profile.
        </Button>
      )}
      {isAdmin && (
        <button onClick={handleAdminButtonClick}>Admin button.</button>
      )}
      {isModerator && (
        <button onClick={handleModeratorButtonClick}>Moderator button.</button>
      )}
      <Modal
        title="Edit profile"
        open={isModalOpen}
        onOk={handleOk}
        onShow={showModal}
        okButtonProps={{ disabled: !(userName && userEmail && userAge) }}
        onCancel={handleCancel}
      >
        <Form>
          <Form.Item label="Username">
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Age">
            <Input value={newAge} onChange={(e) => setNewAge(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Modarator button"
        open={isModalOpen}
        onOk={handleOk}
        onShow={showModal}
        okButtonProps={{ disabled: !(userName && userEmail && userAge) }}
        onCancel={handleCancel}
      >
        <Form>
          <Form.Item label="Username">
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Age">
            <Input value={newAge} onChange={(e) => setNewAge(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IdentityInfo;
