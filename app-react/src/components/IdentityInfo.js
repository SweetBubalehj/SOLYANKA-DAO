import React, { useEffect, useState } from "react";
import {
  useContractRead,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Address, ABI } from "../contracts/sbtContract";
import {
  Card,
  Typography,
  Modal,
  Form,
  Input,
  Button,
  Space,
  Spin,
  Alert,
  notification,
  Avatar,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import useCheckIdentity from "../utils/isIdentified";

const { Title, Text } = Typography;

const IdentityInfo = () => {
  //Contract part
  const { address } = useAccount();

  const [newUserName, setNewUserName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAge, setNewAge] = useState(13);

  const isVerified = useCheckIdentity();

  const { config } = usePrepareContractWrite({
    address: Address,
    abi: ABI,
    functionName: "updateDataSoul",
    args: [newUserName, newEmail, newAge],
  });

  const {
    data,
    isLoading: UpdateSoulLoading,
    isSuccess: UpdateSoulSuccess,
    write,
  } = useContractWrite(config);

  const { data: identifyInfo } = useContractRead({
    address: Address,
    abi: ABI,
    functionName: "getSoul",
    args: [address],
  });

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

  useEffect(() => {
    if (UpdateSoulLoading) {
      transactionIsLoading();
    }
  }, [UpdateSoulLoading]);

  useEffect(() => {
    if (UpdateSoulSuccess) {
      transactionIsSuccess();
    }
  }, [UpdateSoulSuccess]);

  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userAge, setUserAge] = useState("0");
  const [hasKYC, setHasKYC] = useState(null);
  const [hasRights, setHasRigths] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log(identifyInfo);
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
    //setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Fixed typo
  };
  //

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

  return (
    <Card title="Your profile">
      {address && (
        <>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
          >
            <Avatar
              size={64}
              style={{ marginRight: 24 }}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={2}>Welcome, {userName}!</Title>
              <Text>Email: {userEmail}</Text>
              <br />
              <Text>Age: {userAge.toString()}</Text>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            {hasKYC ? (
              <Text>You have completed KYC.</Text>
            ) : (
              <Text>You haven't completed KYC.</Text>
            )}
            <div>{hasRights && <Text>You have moderator rights.</Text>}</div>
          </div>
        </>
      )}
      {address && !UpdateSoulLoading && (
        <Button type="primary" onClick={showModal} style={{ marginBottom: 24 }}>
          Edit profile
        </Button>
      )}
      <Modal
        title="Edit profile"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: !(newUserName && newEmail && newAge) }}
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
